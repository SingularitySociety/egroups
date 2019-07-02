import Privileges from '../../react-lib/src/const/Privileges.js';
import * as messaging from '../utils/messaging';

export const createGroup = async (db:FirebaseFirestore.Firestore, data, context) => {
  if (!context.auth || !context.auth.uid) {
    return {result: false};
  }
  const userId = context.auth.uid;
  if (!data || !data.title || !data.ownerName) {
    return {result: false};
  }
  const { title, ownerName } = data;
  const created = new Date();

  const doc = await db.collection("groups").add({
    created,
    title, 
    owner:userId, 
    ownerName
  });
  const groupId = doc.id;

  await db.doc(`/groups/${groupId}/owners/${userId}`).set({
    created
  });
  await db.doc(`/groups/${groupId}/members/${userId}`).set({
    created,
    displayName:ownerName,
    uid: userId,
    groupId: groupId,
  });

  return {
    groupId,
    result: true,
  };  
}

export const memberDidCreate = async (db, snapshot, context) => {
  const { groupId, userId } = context.params;
  const owner = (await db.doc(`/groups/${groupId}/owners/${userId}`).get()).data();
  // We set the privilege of the owner here so that the owner can leave and join. 
  const stripeData = (await db.doc(`/groups/${groupId}/members/${userId}/secret/stripe`).get()).data();
  // todo check valid subscription and set expire
  
  // owner or member
  const privilege = owner ? 0x2000000 : (stripeData && stripeData.subscription ? Privileges.subscriber : 1);

  await db.doc("/groups/" + groupId + "/privileges/" + userId).set({
    value: privilege,
    created: new Date(),
  });
  await messaging.subscribe_new_group(userId, groupId, db, messaging.subscribe_topic);
  
  // This is for custom token to control the access to Firestore Storage.
  return db.doc(`/privileges/${userId}`).set({
    [groupId]: privilege 
  }, {merge:true});
};
