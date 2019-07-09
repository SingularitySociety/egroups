import Privileges from '../../react-lib/src/const/Privileges.js';
import * as messaging from '../utils/messaging';
import * as utils from '../utils/utils';

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
    userId: userId,
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

export const memberDidDelete  = async (db, admin, snapshot, context) => {
  const { groupId, userId } = context.params;
  await db.doc("/groups/" + groupId + "/privileges/" + userId).delete();

  await utils.deleteSubcollection(snapshot, "private");
  await utils.deleteSubcollection(snapshot, "secret");

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
  // todo delete stripe subscription 
  
  // We need to remove all the images associated with this user
  const bucket = admin.storage().bucket();
  const path = `groups/${groupId}/members/${userId}/`;
  bucket.deleteFiles({prefix:path}, (errors)=>{
    console.log("deleteFiles: ", path, errors);
  });
}

export const createGroupName = async (db:FirebaseFirestore.Firestore, data, context) => {
  if (!context.auth || !context.auth.uid) {
    return {result: false, message:"missing.uid"};
  }
  const { groupId, path, title, types } = data;
  if (!groupId || !path || !title || !types) {
    return {result: false, message:"missing.params"};
  }

  const refName = db.doc(`groupNames/${path}`);
  const refGroup = db.doc(`groups/${groupId}`);
  return db.runTransaction(async (tr)=>{
    const docName = await tr.get(refName);
    const dataName = docName.data();
    if (dataName) {
      throw new Error("group.name.taken");
    }
    const docGroup = await tr.get(refGroup);
    const dataGroup = docGroup.data();
    if (!dataGroup) {
      throw new Error("group.missing");
    }
    if (dataGroup.groupName) {
      throw new Error("group.has.name");
    }
    if (dataGroup.owner !== context.auth.uid) {
      throw new Error("group.different.owner");
    }

    tr.set(refName, { groupId:groupId });
    tr.set(refGroup, { 
      groupName:path, 
      title,
      privileges: {
        channel: { read:Privileges.member, write:Privileges.member, create:Privileges.member },
        article: { read:Privileges.member, create:Privileges.member, comment:Privileges.member },
        page: { read:Privileges.guest, create:Privileges.admin, comment:Privileges.admin },
        event: { read:Privileges.member, create:Privileges.member, attend:Privileges.member },
        member: { read:Privileges.member, write:Privileges.admin },
        invitation: { create:Privileges.admin },
      },
      open:types.open,
      subscription:types.subscription,
    }, {merge:true});
  }).then(() => {
    return { result: true };
  }).catch((e) => {
    // Handle Error
    console.log(e.message);
    return { result: false, message: e.message };
  });
}

export const groupDidDelete = async (db, admin, snapshot, context) => {
    const { groupId } = context.params;
    const value = snapshot.data();
    if (value && value.groupName) {
      await admin.firestore().doc("/groupNames/" + value.groupName).delete();
    }

    // We need to delete all sub collections (except privileges)
    await utils.deleteSubcollection(snapshot, "channels");
    await utils.deleteSubcollection(snapshot, "pages");
    await utils.deleteSubcollection(snapshot, "articles");
    await utils.deleteSubcollection(snapshot, "events");
    await utils.deleteSubcollection(snapshot, "members");
    await utils.deleteSubcollection(snapshot, "owners");
    await utils.deleteSubcollection(snapshot, "private");
    await utils.deleteSubcollection(snapshot, "secret");

    // We need to remove all the images associated with this user
    const bucket = admin.storage().bucket();
    const path = `groups/${groupId}/`;
    bucket.deleteFiles({prefix:path}, (errors)=>{
      console.log("deleteFiles: ", path, errors);
    });
}
