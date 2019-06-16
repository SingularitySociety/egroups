import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
//import * as fs from 'fs';
import * as messaging from './messaging';

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
    const value = snapshot.data();
    if (value && value.groupName) {
      await admin.firestore().doc("/groupNames/" + value.groupName).delete();
    }
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
    return admin.firestore().runTransaction(async (tr) => {
      const doc = await tr.get(ref);
      const data = doc.data();
      if (data) {
        delete data[groupId];
        return tr.set(ref, data); // no merge
      }
      return true;
    });
  });

export const messageDidCreate = functions.firestore.document('groups/{groupId}/channels/{channelId}/messages/{messageId}')
  .onCreate((snapshot, context)=>{
    const { groupId, channelId } = context.params;
    const newValue = snapshot.data();
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
    return messaging.subscribe_group(newTokens, oldTokens, userId, db,  messaging.subscripe_topic);
  });

