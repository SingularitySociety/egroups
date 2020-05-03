import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

import * as messaging from './utils/messaging';
import * as firebase_utils from './utils/firebase_utils';

import * as stripeFunctions from './functions/stripe';
import * as imageFunctions from './functions/image';
import * as groupFunctions from './functions/group';
import * as ogpFunctions from './functions/ogp';
import * as onetimesmsFunctions from './functions/onetimesms';
import * as emailFunctions from './functions/email';

import * as express from './functions/express';

// for mocha watch
if (!admin.apps.length) {
  admin.initializeApp();
}

// for test, db is not immutable
let db = admin.firestore();
export const updateDb = (_db) => {
  db = _db;
}

export const api = functions.https.onRequest(express.app);

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

export const requestOnetimeSMS = functions.https.onCall(async (data, context) => {
  return await onetimesmsFunctions.requestOnetimeSMS(db, data, context);
});

export const confirmOnetimeSMS = functions.https.onCall(async (data, context) => {
  return await onetimesmsFunctions.confirmOnetimeSMS(db, data, context);
});

export const createCustomAccount = functions.https.onCall(async (data, context) => {
  return await stripeFunctions.createCustomAccount(db, data, context);
});

export const updateCustomAccount = functions.https.onCall(async (data, context) => {
  return await stripeFunctions.updateCustomAccount(db, data, context);
});

export const createCustomer = functions.https.onCall(async (data, context) => {
  return await stripeFunctions.createCustomer(db, data, context);
});
export const updateCustomerCardExpire = functions.https.onCall(async (data, context) => {
  return await stripeFunctions.updateCustomerCardExpire(db, data, context);
});

export const createSubscription = functions.https.onCall(async (data, context) => {
  return await stripeFunctions.createSubscription(db, data, context);
})

export const cancelSubscription = functions.https.onCall(async (data, context) => {
  return await stripeFunctions.cancelSubscription(db, data, context);
})

export const groupDidUpdate = functions.firestore.document('groups/{groupId}').onUpdate(async (change, context) => {
  await stripeFunctions.groupDidUpdate(db, change, context);
});

export const createGroup = functions.https.onCall(async (data, context) => {
  return await groupFunctions.createGroup(db, data, context);
});

export const createGroupName = functions.https.onCall(async (data, context) => {
  return await groupFunctions.createGroupName(db, data, context);
});
export const getPaymentIntentsLog = functions.https.onCall(async (data, context) => {
  return await groupFunctions.getPaymentIntentsLog(db, data, context);
});
export const getPayoutLog = functions.https.onCall(async (data, context) => {
  return await groupFunctions.getPayoutLog(db, data, context);
});

export const groupDidDelete = functions.firestore.document('groups/{groupId}').onDelete(async (snapshot, context)=>{
  await groupFunctions.groupDidDelete(db, admin, snapshot, context);
});

export const memberDidCreate = functions.firestore.document('groups/{groupId}/members/{userId}').onCreate(async (snapshot, context)=>{
  await groupFunctions.memberDidCreate(db, snapshot, context);
});

export const processInvite = functions.https.onCall(async (data, context) => {
  return await groupFunctions.processInvite(db, admin, data, context);
});

export const articleDidDelete = functions.firestore.document('groups/{groupId}/articles/{articleId}')
  .onDelete((snapshot, context)=>{
    return firebase_utils.deleteSubcollection(snapshot, "sections");
  });

export const pageDidDelete = functions.firestore.document('groups/{groupId}/pages/{articleId}')
  .onDelete((snapshot, context)=>{
    return firebase_utils.deleteSubcollection(snapshot, "sections");
  });

export const channelDidDelete = functions.firestore.document('groups/{groupId}/channels/{channelId}')
  .onDelete((snapshot, context)=>{
    return firebase_utils.deleteSubcollection(snapshot, "messages");
  });

export const sectionDidDelete = functions.firestore.document('groups/{groupId}/{articles}/{articleId}/sections/{sectionId}')
  .onDelete(async (snapshot, context) => {
    await imageFunctions.deleteImage(snapshot, context);
  });

export const sectionDidWrite = functions.firestore.document('groups/{groupId}/{articles}/{articleId}/sections/{sectionId}')
  .onWrite(async (change, context) => {
    await ogpFunctions.opg_update(change, context);
  });

export const memberDidDelete = functions.firestore.document('groups/{groupId}/members/{userId}').onDelete(async (snapshot, context) => {
  await groupFunctions.memberDidDelete(db, admin, snapshot, context);
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

export const imageProcessing = functions.storage.object().onFinalize(async (object) => {
  return imageFunctions.imageProcessing(db, object);
});

export const sendMail = functions.https.onCall(async (data, context) => {
  return await emailFunctions.sendMail(db, data, context);
});

