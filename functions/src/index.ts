import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

import * as messaging from './utils/messaging';

import * as stripeFunctions from './functions/stripe';
import * as imageFunctions from './functions/image';
import * as groupFunctions from './functions/group';

// for mocha watch
if (!admin.apps.length) {
  admin.initializeApp();
}

export const app = express();
app.use(cors());

app.get('/api/hello', async (req:any, res) => {
  console.log('hello');
  res.send("hello world with Express");
});

// for test, db is not immutable
let db = admin.firestore();
export const updateDb = (_db) => {
  db = _db;
}

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
    const privileges = (await db.doc(`/privileges/${context.auth.uid}`).get()).data();    
    const token = await admin.auth().createCustomToken(context.auth.uid, {privileges});
    return { token, privileges }
  }
  return { token: null };
});

export const createCustomer = functions.https.onCall(async (data, context) => {
  return await stripeFunctions.createCustomer(db, data, context);
});

export const createSubscribe = functions.https.onCall(async (data, context) => {
  return await stripeFunctions.createSubscribe(db, data, context);
})

export const groupDidUpdate = functions.firestore.document('groups/{groupId}').onUpdate(async (change, context) => {
  await stripeFunctions.groupDidUpdate(db, change, context);
});

export const groupDidCreate = functions.firestore.document('groups/{groupId}').onCreate(async (snapshot, context)=>{
  await groupFunctions.groupDidCreate(db, snapshot, context);
});
            
const deleteSubcollection = async (snapshot:FirebaseFirestore.DocumentSnapshot, name:string) => {
  const limit = 10;
  let count:number;
  do {
    const sections = await snapshot.ref.collection(name).limit(limit).get();
    count = sections.size;
    sections.forEach(async doc=>{
      await doc.ref.delete();
    });
  } while(count === limit);
}  

export const groupDidDelete = functions.firestore.document('groups/{groupId}')
  .onDelete(async (snapshot, context)=>{
    const { groupId } = context.params;
    const value = snapshot.data();
    if (value && value.groupName) {
      await admin.firestore().doc("/groupNames/" + value.groupName).delete();
    }

    // We need to delete all sub collections (except privileges)
    await deleteSubcollection(snapshot, "channels");
    await deleteSubcollection(snapshot, "pages");
    await deleteSubcollection(snapshot, "articles");
    await deleteSubcollection(snapshot, "events");
    await deleteSubcollection(snapshot, "members");
    await deleteSubcollection(snapshot, "owners");

    // We need to remove all the images associated with this user
    const bucket = admin.storage().bucket();
    const path = `groups/${groupId}/`;
    bucket.deleteFiles({prefix:path}, (errors)=>{
      console.log("deleteFiles: ", path, errors);
    });
  });

export const memberDidCreate = functions.firestore.document('groups/{groupId}/members/{userId}').onCreate(async (snapshot, context)=>{
  await groupFunctions.memberDidCreate(db, snapshot, context);
});

export const articleDidDelete = functions.firestore.document('groups/{groupId}/articles/{articleId}')
  .onDelete((snapshot, context)=>{
    return deleteSubcollection(snapshot, "sections");
  });

export const pageDidDelete = functions.firestore.document('groups/{groupId}/pages/{articleId}')
  .onDelete((snapshot, context)=>{
    return deleteSubcollection(snapshot, "sections");
  });

export const channelDidDelete = functions.firestore.document('groups/{groupId}/channels/{channelId}')
  .onDelete((snapshot, context)=>{
    return deleteSubcollection(snapshot, "messages");
  });

export const sectionDidDelete = functions.firestore.document('groups/{groupId}/{articles}/{articleId}/sections/{sectionId}').onDelete(async (snapshot, context) => {
  await imageFunctions.deleteImage(snapshot, context);
});

export const memberDidDelete = functions.firestore.document('groups/{groupId}/members/{userId}')
  .onDelete(async (snapshot, context)=>{
    const { groupId, userId } = context.params;
    await db.doc("/groups/" + groupId + "/privileges/" + userId).delete();

    await deleteSubcollection(snapshot, "private");

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

    return messaging.subscribe_group(newTokens, oldTokens, userId, db, messaging.subscribe_topic, messaging.unsubscribe_topic);
  });

export const updateTopicSubscription = functions.https.onCall(async (data, context) => {
  if (context.auth) {
    await messaging.subscribe_all_groups(context.auth.uid, db, messaging.subscribe_topic);
    return {  }
  }
  return {  };
});

export const generateThumbnail = functions.storage.object().onFinalize(async (object) => {
  return imageFunctions.generateThumbnail(db, object);
});


