import * as admin from 'firebase-admin';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

import * as sharp from 'sharp';

import * as UUID from "uuid-v4";

const thumbPrefix = 'thumb_';

const runImageMagick = async (bucket, orinalFilePath, dirName, fileName, size, contentType) => {
  const thumbFileName = thumbPrefix + `${fileName}_${size}`;

  const outFilePath = path.join(os.tmpdir(), thumbFileName);
  // Generate a thumbnail using ImageMagick.
  try {
    const res = await sharp(orinalFilePath).rotate().resize(size).toFile(outFilePath);
    
    // upload
    const uuid = UUID();
    const metadata = {
      contentType: contentType,
      metadata: {
        firebaseStorageDownloadTokens: uuid
      }      
    };
    
    const thumbFilePath = path.join(dirName, thumbFileName);
    const ret = await bucket.upload(outFilePath, {
      destination: thumbFilePath,
      metadata: metadata,
    });
    // generate public image url see: https://stackoverflow.com/questions/42956250/get-download-url-from-file-uploaded-with-cloud-functions-for-firebase
    const file = ret[0];
    return "https://firebasestorage.googleapis.com/v0/b/" + bucket.name + "/o/" + encodeURIComponent(file.name) + "?alt=media&token=" + uuid;
  } catch (e) {
    console.log("error", e);
  }
  return false;
}

export const createThumbnail = async (object, sizes) => {
  const fileBucket = object.bucket; // e-group-test.appspot.com
  const filePath = object.name; // groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q
  const contentType = object.contentType; // image/jpeg

  if (!filePath) {
    return false;
  }
  // Get the file name.
  const fileName = path.basename(filePath);
  if (fileName.startsWith(thumbPrefix)) {
    console.log('Already a Thumbnail.');
    return false;
  }
  const dirName = path.dirname(filePath);
  
  // Download file from bucket.
  const bucket = admin.storage().bucket(fileBucket);
  const tempFilePath = path.join(os.tmpdir(), fileName);

  await bucket.file(filePath).download({destination: tempFilePath});
  console.log('Image downloaded locally to', tempFilePath);

  const ret = {}
  await asyncForEach(sizes, async(size) => {
    const res = await runImageMagick(bucket, tempFilePath, dirName, fileName, size, contentType)
    if (res) ret[size] = res;
  });
  
  // Once the thumbnail has been uploaded delete the local file to free up disk space.
  fs.unlinkSync(tempFilePath);
  return ret;
}

async function asyncForEach(array, callback) {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}
