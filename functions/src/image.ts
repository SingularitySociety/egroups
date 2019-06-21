import * as admin from 'firebase-admin';

import * as path from 'path';
import * as os from 'os';
import * as fs from 'fs';

import * as sharp from 'sharp';

const thumbPrefix = 'thumb_';

const runImageMagick = async (bucket, orinalFilePath, dirName, fileName, size, contentType) => {
  const thumbFileName = thumbPrefix + `${fileName}_${size}`;

  const outFilePath = path.join(os.tmpdir(), thumbFileName);
  // Generate a thumbnail using ImageMagick.
  try {
    const res = await sharp(orinalFilePath).rotate().resize(size).toFile(outFilePath);
    console.log(res);
    
    // upload
    const metadata = {
      contentType: contentType,
    };
    
    const thumbFilePath = path.join(dirName, thumbFileName);
    await bucket.upload(outFilePath, {
      destination: thumbFilePath,
      metadata: metadata,
    });
  } catch (e) {
    console.log("error", e);
  }
}

export const createThumbnail = async (object) => {
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

  await runImageMagick(bucket, tempFilePath, dirName, fileName, 200, contentType)
  await runImageMagick(bucket, tempFilePath, dirName, fileName, 600, contentType)

  // Once the thumbnail has been uploaded delete the local file to free up disk space.
  fs.unlinkSync(tempFilePath);
  return true
}

