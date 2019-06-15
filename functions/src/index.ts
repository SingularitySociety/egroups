import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';
//import * as fs from 'fs';

admin.initializeApp();

const app = express();
app.use(cors());

app.get('/api/hello', async (req:any, res) => {
  console.log('hello');
  res.send("hello world with Express");
});

export const api = functions.https.onRequest(app);

export const groupDidCreate = functions.firestore.document('groups/{groupId}')
  .onCreate(async (snapshot, context)=>{
    const { groupId } = context.params;
    const db = admin.firestore();
    console.log(context);
    const newValue = snapshot.data(); // this is a hack because I can't access context.auth.uid for some reason
    const userId = newValue && newValue.owner;
    await db.doc(`/groups/${groupId}/owners/${userId}`).set({
      created: new Date()
    });
    // The owner becomes a member automatically. memberDidCreate will automatically create the privilege for the owner. 
    return db.doc(`/groups/${groupId}/members/${userId}`).set({
      created: new Date(),
      displayName: (newValue && newValue.ownerName) || "admin",
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
    return db.doc("/groups/" + groupId + "/privileges/" + userId).set({
      // We set the privilege of the owner here so that the owner can leave and join. 
      value: owner ? 0x2000000 : 1, // owner or member
      created: new Date(),
    });
  });

export const memberDidDelete = functions.firestore.document('groups/{groupId}/members/{userId}')
  .onDelete((snapshot, context)=>{
    const { groupId, userId } = context.params;
    return admin.firestore().doc("/groups/" + groupId + "/privileges/" + userId).delete();
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
