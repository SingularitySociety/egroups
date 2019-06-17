import * as admin from 'firebase-admin';
import * as utils from './utils'

const groupId_to_topic = (groupId) => {
  return "g_" + groupId;
}

const get_topic_from_group = async (db, uid) => {
  const groupsSnapShot = await db.collectionGroup('members').where("uid", "==", uid).get()
  const topics = groupsSnapShot.docs.map((doc) => {
    return groupId_to_topic(doc.data().groupId);
  });
  return topics;
}

export const subscribe_new_group = async(userId, groupId, db, subscribe) => {
  console.log(`/users/${userId}/private/tokens`);
  const token_data = await db.doc(`/users/${userId}/private/tokens`).get();
  if (token_data && token_data.data()) {
    const tokens = token_data.data().tokens;
    if (tokens && tokens.length > 0) {
      await subscribe(tokens, groupId_to_topic(groupId))
    }
  }
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

export const subscribe_topic = async (tokens, topic) => {
  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    console.log('Successfully subscribed to topic:', response);
  } catch(error) {
    console.log('Error subscribing to topic:', error);
  }
}

export const unsubscribe_topic = async (tokens, topic) => {
  try {
    const response = await admin.messaging().unsubscribeFromTopic(tokens, topic);
    console.log('Successfully subscribed to topic:', response);
  } catch(error) {
    console.log('Error subscribing to topic:', error);
  }
}

export const push_message_to_group = async (groupId, channelId, messageId, messagePayload) => {
  const message = {
    data: {
      groupId,
      channelId,
      messageId,
      message: messagePayload.message,
      messageUserName: messagePayload.userName,
      messageUID: messagePayload.userId,
    },
    notification: {
      "title": "Chat",
      "body": messagePayload.message,
    },
    topic: groupId_to_topic(groupId),
  };
  await admin.messaging().send(message)
    .then((response) => {
      console.log('Successfully sent message:', response);
    })
    .catch((error) => {
      console.log('Error sending message:', error);
    });
}
