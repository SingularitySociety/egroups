import * as admin from 'firebase-admin';

import * as image from '../utils/image';
import * as constant from '../utils/constant';

export const generateThumbnail = async (db, object) => {
  const filePath = object.name; // groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q
  const contentType = object.contentType; // image/jpeg
  
  if (!contentType || !contentType.startsWith("image")) {
    return false;
  }
  if (!filePath) {
    return false;
  }
  const paths = filePath.split("/");
  if (!image.validImagePath(filePath, constant.matchImagePaths)) {
    console.log("not hit", paths);
    return false;
  }

  const imageId = paths[paths.length -1];
  const store_path = image.getStorePath(filePath);
  
  const thumbnails = await image.createThumbnail(object, constant.thumbnailSizes)
  if (thumbnails) {
    const image_data_ref = db.doc(store_path);
    const data = {[imageId]:{thumbnails: thumbnails}};
    await image_data_ref.set(data, {merge:true})
  }
  return true
}
export const deleteImage = async (snapshot, context) => {
  const { groupId, articles, articleId, sectionId } = context.params;
  const bucket = admin.storage().bucket();
  const path = `groups/${groupId}/${articles}/${articleId}/${sectionId}`;
  const pathThumbs = `groups/${groupId}/${articles}/${articleId}/thumb_${sectionId}`;
  if (!(articles === "articles" || articles === "pages")) {
    console.log("unexpected", articles);
    return false;
  }
  try {
    await bucket.deleteFiles({prefix:path});
    await bucket.deleteFiles({prefix:pathThumbs});
    console.log("deleting section images succeeded:", path);
  } catch(error) {
    console.log("deleting section images failed:", path, error);
  }
  return true;
}