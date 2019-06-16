import * as admin from 'firebase-admin';
import * as utils from './utils'

export const subscribe_group = async (newTokens, oldTokens, userId, db, subscribe) => {
  // see diff
  if (newTokens.length === oldTokens.length) {
    return;
  }
  
  // get all groups
  const groupsSnapShot = await db.collectionGroup('members').where("uid", "==", "alice").get()
  const topics = groupsSnapShot.docs.map((doc) => {
    return "g_" + doc.data().groupId;
  });
  
  if (newTokens.length > oldTokens.length) {
    // add
    const tokens = utils.array_diff(newTokens, oldTokens);
    topics.forEach((topic) => {
      subscribe(tokens, topic);
    });
  }
  if (newTokens.length < oldTokens.length) {
    //remove
    const diff = utils.array_diff(oldTokens, newTokens);
    console.log(diff);
  } 
  return

}

export const subscripe_topic = (tokens, topic) => {
  try {
    const response = admin.messaging().subscribeToTopic(tokens, topic);
    console.log('Successfully subscribed to topic:', response);
  } catch(error) {
    console.log('Error subscribing to topic:', error);
  }
}