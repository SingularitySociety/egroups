import * as admin from 'firebase-admin';
import * as utils from './utils'


const get_topic_from_group = async (db, uid) => {
  const groupsSnapShot = await db.collectionGroup('members').where("uid", "==", uid).get()
  const topics = groupsSnapShot.docs.map((doc) => {
    return "g_" + doc.data().groupId;
  });
  return topics;
}

export const subscribe_group = async (newTokens, oldTokens, userId, db, subscribe, unsubscribe) => {
  // see diff
  if (newTokens.length === oldTokens.length) {
    return;
  }
  
  // get all groups
  const topics = await get_topic_from_group(db, userId)
  
  if (newTokens.length > oldTokens.length) {
    // add
    const tokens = utils.array_diff(newTokens, oldTokens);
    topics.forEach((topic) => {
      subscribe(tokens, topic);
    });
  }
  if (newTokens.length < oldTokens.length) {
    //remove
    const tokens = utils.array_diff(oldTokens, newTokens);
    topics.forEach((topic) => {
      unsubscribe(tokens, topic);
    });
  } 
  return

}

export const subscribe_topic = (tokens, topic) => {
  try {
    const response = admin.messaging().subscribeToTopic(tokens, topic);
    console.log('Successfully subscribed to topic:', response);
  } catch(error) {
    console.log('Error subscribing to topic:', error);
  }
}

export const unsubscribe_topic = (tokens, topic) => {
  try {
    const response = admin.messaging().unsubscribeFromTopic(tokens, topic);
    console.log('Successfully subscribed to topic:', response);
  } catch(error) {
    console.log('Error subscribing to topic:', error);
  }
}
