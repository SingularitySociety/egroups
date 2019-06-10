import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import * as firebase from "firebase/app";
import "firebase/firestore";
import CreateNew from './CreateNew';
import AccessDenied from './AccessDenied';
import Message from './Message';

const styles = theme => ({
});

class Chat extends React.Component {
  state = {channel:{}, messages:[]}
  async componentDidMount() {
    const { db, group, match:{params:{channelId}} } = this.props;
    console.log(channelId);
    const ref = db.doc(`groups/${group.groupId}/channels/${channelId}`);
    const channel = (await ref.get()).data();
    this.setState({channel});
    console.log(channel);
    this.refMessages = ref.collection("messages");
    this.detacher = this.refMessages.orderBy("created").onSnapshot((snapshot)=>{
      const messages=[];
      snapshot.forEach((doc) => {
        const message = doc.data();
        message.messageId = doc.id;
        messages.push(message);
      })
      this.setState({messages});
      console.log(messages);

      const {user, db} = this.props; // DO NOT MOVE to TOP 
      if (user) {
        const channels = {};
        channels[channelId] = { l:firebase.firestore.FieldValue.serverTimestamp() };
        console.log(`groups/${group.groupId}/members/${user.uid}/private/history`);
        db.doc(`groups/${group.groupId}/members/${user.uid}/private/history`).set({
          channels
        }, {merge:true})
      }
    });
  }

  componentWillUnmount() {
    this.detacher && this.detacher();
  }
  
  postMessgae = async (message) => {
    const { user, member } = this.props;
    await this.refMessages.add({
      created: firebase.firestore.FieldValue.serverTimestamp(),
      message,
      userId: user.uid,
      userName: member.displayName
    });
  }

  render() {
    const { channel, messages } = this.state;
    const { member } = this.props;
    if (!channel) {
      return "";
    }
    const canRead = ((member && member.privilege) || 0) >= channel.read;
    const canWrite = ((member && member.privilege) || 0) >= channel.write;
    if (!canRead) {
      return <AccessDenied />
    }
    return (<div>
      <Typography component="h2" variant="h5" gutterBottom>
        { channel.title }
      </Typography>
      <div>
      { messages.map((message)=>{
        return <Message key={message.messageId} message={message} />
      }) }
      { canWrite && <CreateNew createNew={ this.postMessgae } 
          action="Post" label="Message" multiline={true} /> }
      </div>
    </div>)
  }
}

Chat.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Chat);