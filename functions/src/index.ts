import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as express from 'express';
import * as cors from 'cors';

import * as merge from 'deepmerge';

//import * as fs from 'fs';
import * as messaging from './messaging';
import * as image from './image';
import * as constant from './constant';
import * as utils from './utils'

import * as stripe from './stripe';

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

export const groupDidCreate = functions.firestore.document('groups/{groupId}')
  .onCreate(async (snapshot, context)=>{
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
  });

export const groupDidUpdate = functions.firestore.document('groups/{groupId}')
  .onUpdate(async (change, context) => {
    const { groupId } = context.params;
    const after = change.after.exists ? change.after.data() ||{} : {};
    if (after.subscription) {
      const stripeRef = db.doc(`/groups/${groupId}/private/stripe`);
      const stripeData = (await stripeRef.get()).data();
      if (!stripeData || !stripeData.production) {
        const production = await stripe.createProduct(after.groupName, after.groupName, groupId);
        await stripeRef.set({production: production}, {merge:true});
      }

      if (after.plans) {
        const existPlans = (stripeData && stripeData.plans) || {};
        const newPlans = {};
        await utils.asyncForEach(after.plans, async(plan) => {
          // todp validate plan
          const price = plan.price;
          if (stripeData && (!stripeData.plans || !stripeData.plans[price])) {
            const stripePlan = await stripe.createPlan(groupId, price);
            newPlans[price] = stripePlan;
          }
        });
        if (Object.keys(newPlans).length > 0) {
          const updatedPlan = merge(existPlans, newPlans);
          await stripeRef.set({plans: updatedPlan}, {merge:true});
        }
      }
      // const value = snapshot.data();
    }
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

export const memberDidCreate = functions.firestore.document('groups/{groupId}/members/{userId}')
  .onCreate(async (snapshot, context)=>{
    const { groupId, userId } = context.params;
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

export const sectionDidDelete = functions.firestore.document('groups/{groupId}/{articles}/{articleId}/sections/{sectionId}')
  .onDelete(async (snapshot, context)=>{
    const { groupId, articles, articleId, sectionId } = context.params;
    const bucket = admin.storage().bucket();
    const path = `groups/${groupId}/${articles}/${articleId}/${sectionId}`;
    const pathThumbs = `groups/${groupId}/${articles}/${articleId}/thumb_${sectionId}`;
    if (!(articles === "articles" || articles === "pages")) {
      console.log("unexpected", articles);
      return false;
    }
    try {
      await bucket.deleteFiles({prefix:path});
      await bucket.deleteFiles({prefix:pathThumbs});
      console.log("deleting section images succeeded:", path);
    } catch(error) {
      console.log("deleting section images failed:", path, error);
    }
    return true;
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
  const filePath = object.name; // groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q
  const contentType = object.contentType; // image/jpeg
  
  if (!contentType || !contentType.startsWith("image")) {
    return false;
  }
  if (!filePath) {
    return false;
  }
  const paths = filePath.split("/");
  if (!image.validImagePath(filePath, constant.matchImagePaths)) {
    console.log("not hit", paths);
    return false;
  }

  const imageId = paths[paths.length -1];
  const store_path = image.getStorePath(filePath);
  
  const thumbnails = await image.createThumbnail(object, constant.thumbnailSizes)
  if (thumbnails) {
    const image_data_ref = db.doc(store_path);
    const data = {[imageId]:{thumbnails: thumbnails}};
    await image_data_ref.set(data, {merge:true})
  }
  return true
});