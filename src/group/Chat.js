import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import * as firebase from "firebase/app";
import "firebase/firestore";
import CreateNew from './CreateNew';
import AccessDenied from './AccessDenied';

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
      userid: user.uid,
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
        return <div key={message.messageId}>{message.message}</div>
      }) }
      { canWrite && <CreateNew createNew={ this.postMessgae }/> }
      </div>
    </div>)
  }
}

Chat.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Chat);