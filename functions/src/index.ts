import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
//import * as fs from 'fs';
import * as messaging from './messaging';
import * as image from './image';
import * as constant from './constant';

admin.initializeApp();

export const app = express();
app.use(cors());

app.get('/api/hello', async (req:any, res) => {
  console.log('hello');
  res.send("hello world with Express");
});

export const api = functions.https.onRequest(app);

// MEMO: In order to make this work, you need to go to add "Servie Account Toke Creator" role to 
// the associated App Engine default service account. 
// From Firebase console, 
// (1) open the setting, 
// (2) select Service account tab, 
// (3) click "Manage service account permissions"
//   notice that "App Engine default service account" is listed
// (4) Click the "IAM" on the side bar
// (5) Find the "App Engine default service account" and click the Edit button
// (6) Click "+ Add Another Role"
// (7) Select "Service Account Token Creator" and Save
export const getJWT = functions.https.onCall(async (data, context) => {
  if (context.auth) {
    const db = admin.firestore();
    const privileges = (await db.doc(`/privileges/${context.auth.uid}`).get()).data();    
    const token = await admin.auth().createCustomToken(context.auth.uid, {privileges});
    return { token, privileges }
  }
  return { token: null };
});

export const groupDidCreate = functions.firestore.document('groups/{groupId}')
  .onCreate(async (snapshot, context)=>{
    const { groupId } = context.params;
    const db = admin.firestore();
    console.log(context);
    const newValue = snapshot.data(); // BUGBUG: this is a hack because I can't access context.auth.uid for some reason
    const userId = newValue && newValue.owner;
    await db.doc(`/groups/${groupId}/owners/${userId}`).set({
      created: new Date()
    });
    // The owner becomes a member automatically. memberDidCreate will automatically create the privilege for the owner. 
    return db.doc(`/groups/${groupId}/members/${userId}`).set({
      created: new Date(),
      displayName: (newValue && newValue.ownerName) || "admin",
      uid: userId,
      groupId: groupId,
    });
  });

export const groupDidDelete = functions.firestore.document('groups/{groupId}')
  .onDelete(async (snapshot, context)=>{
    const { groupId } = context.params;
    const value = snapshot.data();
    if (value && value.groupName) {
      await admin.firestore().doc("/groupNames/" + value.groupName).delete();
    }
    // We need to remove all the images associated with this user
    const bucket = admin.storage().bucket();
    const path = `groups/${groupId}/`;
    bucket.deleteFiles({prefix:path}, (errors)=>{
      console.log("deleteFiles: ", path, errors);
    });
  });

export const memberDidCreate = functions.firestore.document('groups/{groupId}/members/{userId}')
  .onCreate(async (snapshot, context)=>{
    const { groupId, userId } = context.params;
    const db = admin.firestore();
    const owner = (await db.doc(`/groups/${groupId}/owners/${userId}`).get()).data();
    // We set the privilege of the owner here so that the owner can leave and join. 
    const privilege = owner ? 0x2000000 : 1; // owner or member
    await db.doc("/groups/" + groupId + "/privileges/" + userId).set({
      value: privilege,
      created: new Date(),
    });
    await messaging.subscribe_new_group(userId, groupId, db, messaging.subscribe_topic);
    
    // This is for custom token to control the access to Firestore Storage.
    return db.doc(`/privileges/${userId}`).set({
      [groupId]: privilege 
    }, {merge:true});
  });

export const memberDidDelete = functions.firestore.document('groups/{groupId}/members/{userId}')
  .onDelete(async (snapshot, context)=>{
    const { groupId, userId } = context.params;
    const db = admin.firestore();
    await db.doc("/groups/" + groupId + "/privileges/" + userId).delete();

    // This is for custom token to control the access to Firestore Storage.
    const ref = db.doc(`/privileges/${userId}`);

    await messaging.subscribe_new_group(userId, groupId, db, messaging.unsubscribe_topic);

    // We need to use transaction because there is no way to remove a section of a document atomically.
    await admin.firestore().runTransaction(async (tr) => {
      const doc = await tr.get(ref);
      const data = doc.data();
      if (data) {
        delete data[groupId];
        return tr.set(ref, data); // no merge
      }
      return true;
    });

    // We need to remove all the images associated with this user
    const bucket = admin.storage().bucket();
    const path = `groups/${groupId}/members/${userId}/`;
    bucket.deleteFiles({prefix:path}, (errors)=>{
      console.log("deleteFiles: ", path, errors);
    });
  });

export const messageDidCreate = functions.firestore.document('groups/{groupId}/channels/{channelId}/messages/{messageId}')
  .onCreate(async (snapshot, context)=>{
    const { groupId, channelId, messageId } = context.params;
    const newValue = snapshot.data();
    await messaging.push_message_to_group(groupId, channelId, messageId, newValue);
    // We need to use newValue.created. Otherwise, the person who wrote that message will have an older last access date. 
    return admin.firestore().doc(`/groups/${groupId}/channels/${channelId}`).set({
      updated: (newValue && newValue.created) || new Date()
    }, {merge:true});
  });



export const tokenDidCreate = functions.firestore.document('users/{userId}/private/tokens')
  .onWrite((change, context) => {
    const { userId } = context.params;
    const newTokens = change.after.exists ? ((change.after.data() || {}).tokens || []) : [];
    const oldTokens = change.before ? ((change.before.data() || {}).tokens || []) : [];

    const db = admin.firestore();
    return messaging.subscribe_group(newTokens, oldTokens, userId, db, messaging.subscribe_topic, messaging.unsubscribe_topic);
  });

export const updateTopicSubscription = functions.https.onCall(async (data, context) => {
  if (context.auth) {
    const db = admin.firestore();
    await messaging.subscribe_all_groups(context.auth.uid, db, messaging.subscribe_topic);
    return {  }
  }
  return {  };
});

export const generateThumbnail = functions.storage.object().onFinalize(async (object) => {
  const filePath = object.name; // groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q
  const contentType = object.contentType; // image/jpeg
  
  if (!filePath) {
    return false;
  }
  const paths = filePath.split("/");
  if (!image.validImagePath(filePath, constant.matchImagePaths)) {
    console.log("not hit", paths);
    return false;
  }
  if (!contentType || !contentType.startsWith("image")) {
    return false;
  }

  let store_path = ''; 
  const imageId = paths[paths.length -1];
  if (image.validImagePath(filePath, [constant.articlePath])) {
    store_path = paths.slice(0,4).concat(["sections"], paths.slice(4,5)).join("/");
  } else if (image.validImagePath(filePath, [constant.imagePath])) {
    store_path = paths.slice(0,2).join("/");
    imageId = paths[3]; // "profile"
  } else if (image.validImagePath(filePath, [constant.memberPath])) {
    store_path = paths.slice(0,4).join("/");
    imageId = paths[5]; // "profile", "banner", ...
  }


  if (store_path) {
    const thumbnails = await image.createThumbnail(object, constant.thumbnailSizes)
    if (thumbnails) {
      const db = admin.firestore();
      const image_data_ref = db.doc(store_path);
      const data = imageId ? {[imageId]:{thumbnails: thumbnails}} : {thumbnails: thumbnails};
      await image_data_ref.set(data, {merge:true})
    }
    return true
  } else {
>>>>>>> 7920c9b44ea9b77c7c763e7698601a7018790d98
  if (thumbnails) {
      const image_data_ref = db.doc(store_path);
      await image_data_ref.set({thumbnails: thumbnails}, {merge:true})
    }
  }
  return true
});