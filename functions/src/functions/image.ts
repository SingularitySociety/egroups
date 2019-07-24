import * as admin from 'firebase-admin';
import * as fs from 'fs';

import * as stripeUtils from '../utils/stripe';

import * as image from '../utils/image';
import * as constant from '../utils/constant';
import * as stripeApi from '../apis/stripe';


export const imageProcessing = async (db, object) => {
  const filePath = object.name; // groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q
  const contentType = object.contentType; // image/jpeg
  
  if (!contentType || !contentType.startsWith("image")) {
    return false;
  }
  if (!filePath) {
    return false;
  }
  if (image.validImagePath(filePath, constant.matchImagePaths)) {
    return await generateThumbnail(db, object);
  } else if (image.validImagePath(filePath, [constant.stripeVerificationPath])) {
    return await uploadStripeImage(db, object, image.downloadFile, image.removeFile);
  } else {
    console.log("not hit", filePath);
    return false;
  }
}
export const generateThumbnail = async (db, object) => {
  const filePath = object.name; // groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q
  const paths = filePath.split("/");

  // just image. create thumbnail
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

export const uploadStripeImage = async (db, object, downloadFunc, removeFile) => {
  const filePath = object.name;
  const paths = filePath.split("/");

  const groupId = paths[1];
  // const target = paths[4];

  const refGroup = db.doc(`groups/${groupId}`);
  const groupData = (await refGroup.get()).data();
  if (!groupData) {
    return false;
  }
  const refAccont = db.doc(`groups/${groupId}/secret/account`);
  const refAccontPrivate = db.doc(`groups/${groupId}/private/account`);
  
  const existAccount = await refAccont.get();
  const existAccountPrivate = await refAccont.get();
  if (!existAccount.exists || !existAccountPrivate.exists ) {
    return false;
  }
  const existAccountData = existAccount.data();
  const existAccountPrivateData = existAccountPrivate.data();
  const accountId = existAccountData.account.id;
  const business_type = existAccountData.account.business_type;

  const tmpFile = await downloadFunc(object)
  
  const fileRes = await stripeApi.getStripe().files.create(
    {
      purpose: 'identity_document',
      file: {
        data: fs.readFileSync(tmpFile),
        name: '1.jpg',
        type: 'application/octet-stream'
      }
    },
    {stripe_account: accountId}
  );
  const fileId = fileRes.id;

  if (business_type === "individual") {
    const postData = {
      [business_type]: {
        verification: {
          document: {
            front: fileId,
          }
        }
      }
    };
    const accountRes = await stripeApi.updateCustomAccount(accountId, postData);
    existAccountData.account = accountRes;
    existAccountPrivateData.account = stripeUtils.convCustomAccountData(accountRes);
  } else if (business_type === "company") {
    const postData = {
      verification: {
        document: {
          front: fileId,
        }
      }
    };
    const personId = existAccountData.person.id;
    const personalRes = await stripeApi.updatePerson(accountId, personId, postData);
    existAccountData.personal = personalRes;
    existAccountPrivateData.personal = stripeUtils.convPersonData(personalRes);
  } 
  await db.runTransaction(async (tr)=> {
    tr.set(refAccont, existAccountData)
    tr.set(refAccontPrivate, existAccountPrivateData)
  });

  
  // remove original file
  await removeFile(object);

  return {
    result: true,
  };
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