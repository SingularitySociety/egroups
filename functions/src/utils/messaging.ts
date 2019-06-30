import * as admin from 'firebase-admin';
import * as utils from './utils'

const groupId_to_topic = (groupId) => {
  return "g_" + groupId;
}

export const get_topics_from_all_group = async (db, uid) => {
  const groupsSnapShot = await db.collectionGroup('members').where("uid", "==", uid).get()
  const topics = groupsSnapShot.docs.map((doc) => {
    return groupId_to_topic(doc.data().groupId);
  });
  return topics;
}

export const subscribe_new_group = async(userId, groupId, db, subscribe) => {
  const token_data = await db.doc(`/users/${userId}/private/tokens`).get();
  if (token_data && token_data.data()) {
    const tokens = token_data.data().tokens;
    if (tokens && tokens.length > 0) {
      await subscribe(tokens, groupId_to_topic(groupId))
    }
  }
}

export const subscribe_all_groups = async(userId, db, subscribe) => {
  const token_data = await db.doc(`/users/${userId}/private/tokens`).get();
  const topics = await get_topics_from_all_group(db, userId)
  if (token_data && token_data.data() && topics && topics.length > 0) {
    const tokens = token_data.data().tokens;
    if (tokens && tokens.length > 0) {
      topics.forEach(async (topic) => {
        await subscribe(tokens, topic);
      });
    }
  }
}

export const subscribe_group = async (newTokens, oldTokens, userId, db, subscribe, unsubscribe) => {
  // get all groups
  const topics = await get_topics_from_all_group(db, userId)
  const diff = utils.array_diff(newTokens, oldTokens);
  const increase_tokens = diff[0];
  const decrease_tokens = diff[1];
  if (increase_tokens.length > 0) {
    // add
    topics.forEach((topic) => {
      subscribe(increase_tokens, topic);
    });
  }
  if (decrease_tokens.length > 0) {
    //remove
    topics.forEach((topic) => {
      unsubscribe(decrease_tokens, topic);
    });
  } 
  return

}

export const subscribe_topic = async (tokens, topic) => {
  try {
    const response = await admin.messaging().subscribeToTopic(tokens, topic);
    console.log('subscribe_topic:', tokens, topic);
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
      title: "Chat message",
      groupId,
      channelId,
      messageId,
      message: messagePayload.message,
      messageUserName: messagePayload.userName,
      messageUID: messagePayload.userId,
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
