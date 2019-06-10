import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

admin.initializeApp();

// // Start writing Firebase Functions
// // https://firebase.google.com/docs/functions/typescript
//
export const helloWorld = functions.https.onRequest((request, response) => {
  response.send("Hello from Firebase!");
});

export const memberDidCreate = functions.firestore.document('groups/{groupId}/members/{userId}')
  .onCreate((snapshot, context)=>{
    const { groupId, userId } = context.params;
    return admin.firestore().doc("/groups/" + groupId + "/privileges/" + userId).set({
      value: 1, // member
      created: new Date()
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
