import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, IconButton, Grid } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import CreateNew from '../common/CreateNew';
import AccessDenied from './AccessDenied';
import Message from './Message';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';

const styles = theme => ({
});

class Chat extends React.Component {
  state = {channel:null, messages:[]}
  async componentDidMount() {
    const { db, group, match:{params:{channelId}}, selectTab } = this.props;
    selectTab("channel", `ch/${channelId}`);
    const ref = db.doc(`groups/${group.groupId}/channels/${channelId}`);
    const channel = (await ref.get()).data();

    this.setState({channel});
    this.refMessages = ref.collection("messages");
    this.detacher = this.refMessages.orderBy("created").onSnapshot((snapshot)=>{
      const messages=[];
      snapshot.forEach((doc) => {
        const message = doc.data();
        message.messageId = doc.id;
        messages.push(message);
      })
      this.setState({messages});

      const {user, db} = this.props; // DO NOT MOVE to TOP 
      if (user) {
        const channels = {};
        channels[channelId] = { l:new Date() }; // NOT firebase.firestore.FieldValue.serverTimestamp()
        //console.log("### Updated")
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
      created: new Date(), // firebase.firestore.FieldValue.serverTimestamp(),
      message,
      uid: user.uid,
      userName: member.displayName
    });
  }

  render() {
    const { channel, messages } = this.state;
    const { member, group } = this.props;
    if (!channel) {
      return "";
    }
    const canRead = ((member && member.privilege) || 0) >= channel.read;
    const canWrite = ((member && member.privilege) || 0) >= channel.write;
    const canEdit = true; // HACK: 
    if (!canRead) {
      return <AccessDenied />
    }
    const context = { group };
    return (<div>
        <Grid container>
          <Grid item xs={canEdit ? 11 : 12}>
            <Typography component="h2" variant="h5" gutterBottom>
             { channel.title }
            </Typography>
          </Grid>
          {
            canEdit && 
            <Grid item xs={1}>
              <IconButton size="small" component={Link} to={window.location.pathname+"/settings"}>
                <SettingsIcon />
              </IconButton>
            </Grid>
          }
        </Grid>
      <div>
      { messages.map((message)=>{
        return <Message key={message.messageId} message={message} {...context} />
      }) }
      { canWrite && <CreateNew createNew={ this.postMessgae } 
          action={<FormattedMessage id="post" />} label={<FormattedMessage id="chat.message" />} multiline={true} /> }
      </div>
    </div>)
  }
}

Chat.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Chat);