import Privileges from '../../react-lib/src/const/Privileges.js';
import * as messaging from '../utils/messaging';

export const groupDidCreate = async (db, snapshot, context) => {
  const { groupId } = context.params;
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
};

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
