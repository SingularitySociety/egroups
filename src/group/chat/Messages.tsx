import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Message from './Message';

function Messages(props) {
  const { channel, group, user, db, profiles, callbacks } = props;
  const [messages, setMessages] = useState([]);

  useEffect(()=>{
    console.log("useEffect getting messages");
    const refMessages = db.collection(`groups/${group.groupId}/channels/${channel.channelId}/messages`);
    const detacher = refMessages.orderBy("created").onSnapshot((snapshot)=>{
      const messages=[];
      snapshot.forEach((doc) => {
        const message = doc.data();
        message.messageId = doc.id;
        messages.push(message);
      });
      setMessages(messages);

      if (user) {
        const channels = {};
        channels[channel.channelId] = { l:new Date() }; // NOT firebase.firestore.FieldValue.serverTimestamp()
        db.doc(`groups/${group.groupId}/members/${user.uid}/private/history`).set({
          channels
        }, {merge:true});
      }
    });
    return detacher;
  }, [group, user, db, channel]);

  const context = { callbacks, profiles }; 
  return (
    <div>
      { messages.map((message)=>{
        return <Message key={message.messageId} message={message} {...context} />;
      }) }
    </div>
  );

}

Messages.propTypes = {
  group: PropTypes.object.isRequired,
};

export default Messages;
