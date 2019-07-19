import Privileges from '../../react-lib/src/const/Privileges.js';
import * as messaging from '../utils/messaging';
import * as firebase_utils from '../utils/firebase_utils';
// import * as stripeUtils from '../utils/stripe';
import * as logger from '../utils/logger';
// import * as stripeApi from '../apis/stripe';


export const createGroup = async (db:FirebaseFirestore.Firestore, data, context) => {
  const error_handler = logger.error_response_handler({func: "createGroup", message: "invalid request"});

  if (!context.auth || !context.auth.uid) {
    return error_handler({error_type: logger.ErrorTypes.NoUid});
  }
  const userId = context.auth.uid;
  if (!data || !data.title || !data.ownerName) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
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

  await db.doc(`/groups/${groupId}/members/${userId}/readonly/membership`).set({
    created,
    privilege: Privileges.owner
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
  const membership = (await db.doc(`/groups/${groupId}/members/${userId}/readonly/membership`).get()).data();

  const stripeData = (await db.doc(`/groups/${groupId}/members/${userId}/secret/stripe`).get()).data();
  // todo check valid subscription and set expire
  
  const privilege = (membership && membership.privilege) || (stripeData && stripeData.subscription ? Privileges.subscriber : Privileges.member);

  await messaging.subscribe_new_group(userId, groupId, db, messaging.unsubscribe_topic);

  const refMember = db.doc(`groups/${groupId}/members/${userId}`);
  await refMember.collection("private").doc("history").set({
    // empty object
  });

  // This is for custom token to control the access to Firestore Storage (as well as Firestore).
  return db.doc(`/privileges/${userId}`).set({
    [groupId]: privilege 
  }, {merge:true});
};

export const memberDidDelete  = async (db, admin, snapshot, context) => {
  const { groupId, userId } = context.params;

  // We need to delete all sub collections
  await firebase_utils.deleteSubcollection(snapshot, "private");
  await firebase_utils.deleteSubcollection(snapshot, "secret");
  await firebase_utils.deleteSubcollection(snapshot, "readonly");

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
  const error_handler = logger.error_response_handler({func: "createGroupName", message: "invalid request"});

  if (!context.auth || !context.auth.uid) {
    return error_handler({error_type: logger.ErrorTypes.NoUid});
  }
  const { groupId, path, title, types } = data;
  if (!groupId || !path || !title || !types) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }

  const refName = db.doc(`groupNames/${path}`);
  const refGroup = db.doc(`groups/${groupId}`);
  // const refAccont = db.doc(`groups/${groupId}/secret/account`);
  // const refAccontPrivate = db.doc(`groups/${groupId}/private/account`);

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
    // if (types.subscription) {
    //   const account = await stripeApi.createCustomAccount(groupId);
    //   tr.set(refAccont, {account: account})
    //   tr.set(refAccontPrivate, {
    //     account: stripeUtils.convCustomAccountData(account)
    //   })
    // }
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

    // We need to delete all sub collections
    await firebase_utils.deleteSubcollection(snapshot, "channels");
    await firebase_utils.deleteSubcollection(snapshot, "pages");
    await firebase_utils.deleteSubcollection(snapshot, "articles");
    await firebase_utils.deleteSubcollection(snapshot, "events");
    await firebase_utils.deleteSubcollection(snapshot, "members");
    await firebase_utils.deleteSubcollection(snapshot, "private");
    await firebase_utils.deleteSubcollection(snapshot, "secret");
    await firebase_utils.deleteSubcollection(snapshot, "invites");
    await firebase_utils.deleteSubcollection(snapshot, "owners"); // obsolete (but keep it for now)

    // We need to remove all the images associated with this user
    const bucket = admin.storage().bucket();
    const path = `groups/${groupId}/`;
    bucket.deleteFiles({prefix:path}, (errors)=>{
      console.log("deleteFiles: ", path, errors);
    });
}

export const processInvite = async (db:FirebaseFirestore.Firestore, admin, data, context) => {
  const error_handler = logger.error_response_handler({func: "createGroup", message: "error.invalid.invite"});

  const { groupId, inviteId, inviteKey, validating } = data;
  const refInvite = db.doc(`/groups/${groupId}/invites/${inviteId}`);
  const invite = (await refInvite.get()).data();

  if (!invite) {
    return error_handler({error_type: logger.ErrorTypes.InviteNoInvite});
  }
  const { key, count, accepted, privilege } = invite;
  if (key !== inviteKey || typeof count !== "number" || !privilege) {
    return error_handler({error_type: logger.ErrorTypes.InviteNoKey});
  }
  if  ( count <= Object.keys(accepted).length ) { 
    return error_handler({error_type: logger.ErrorTypes.InviteSoldOut});
  }

  const created = invite.created;
  const duration = invite.duration;
  if (!created || !duration) {
    return error_handler({error_type: logger.ErrorTypes.InviteNoDate});
  }

  if (Date.now() > created.toDate().getTime() + duration) {
    return error_handler({error_type: logger.ErrorTypes.InviteExipred});
  }
 
  if (validating) {
    return { result:true, validating };
  }  

  const { email, displayName } = data;

  if (!context.auth || !context.auth.uid) {
    return error_handler({error_type: logger.ErrorTypes.NoUid});
  }

  const userId = context.auth.uid;
  if (!groupId || !inviteId || !inviteKey) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }

  const refMember = db.doc(`groups/${groupId}/members/${userId}`);
  const docMember = await refMember.get();
  if (docMember.exists) {
    return error_handler({error_type: logger.ErrorTypes.AlreadyMember});
  }

  await admin.firestore().runTransaction(async (tr) => {
    const inviteSnap = (await tr.get(refInvite)).data();
    if (inviteSnap && inviteSnap.count > Object.keys(inviteSnap.accepted).length) {
      inviteSnap.accepted[userId] = true;
      await tr.set(refInvite, inviteSnap);
    }
  });
  const inviteNew = (await refInvite.get()).data();
  if (!inviteNew || !inviteNew.accepted || !inviteNew.accepted[userId]) {
    return error_handler({error_type: logger.ErrorTypes.InviteSoldOut});
  }

  const now = new Date();
  await refMember.collection("readonly").doc("membership").set({
    created:now,
    privilege: invite.privilege,
    invitedBy: invite.invitedBy,
  });
  await refMember.set({ 
      created:now, // LATER: Make it sure that we use the same date format everywhere
      userId: userId,
      displayName: displayName || "",
      email: email || "",
      groupId: groupId,
      invitedBy: invite.invitedBy,
    });

  return { result:true, validating };
}
