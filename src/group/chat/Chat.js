import React from 'react';
import PropTypes from 'prop-types';
import { Typography, IconButton, Grid } from '@material-ui/core';
import SettingsIcon from '@material-ui/icons/Settings';
import CreateNew from '../../common/CreateNew';
import AccessDenied from '../AccessDenied';
import { FormattedMessage } from 'react-intl';
import { Link } from 'react-router-dom';
import Privileges from '../../const/Privileges';
import ErrorMessage from '../ErrorMessage';
import Messages from './Messages';

class Chat extends React.Component {
  state = {channel:null}
  async componentDidMount() {
    const { db, group, match:{params:{channelId}}, callbacks } = this.props;
    callbacks.setTabbar("channel", `ch/${channelId}`);
    const ref = db.doc(`groups/${group.groupId}/channels/${channelId}`);
    this.refMessages = ref.collection("messages");
    try {
      const channel = (await ref.get()).data();
      channel.channelId = channelId;
      this.setState({channel});
    } catch(e) {
      console.log(e);
      const error = { key: "warning.access.denied", channelId:channelId };
      this.setState({error});
      return;
    }
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
    const { channel, error } = this.state;
    const { user, group, profiles, callbacks, db } = this.props;
    if (error) {
      return <ErrorMessage error={error} />
    }
    if (!channel) {
      return "";
    }
    const privilege = callbacks.memberPrivilege() ;
    const uid = (user && user.uid) || null;
    const canRead = privilege >= channel.read;
    const canWrite = privilege >= channel.write;
    const canEdit = uid === channel.owner || privilege >= Privileges.admin;  
    if (!canRead) {
      return <AccessDenied />
    }
    const context = { group, profiles, callbacks, channel, refMessages:this.refMessages, user, db };
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
        <Messages {...context} />
      { canWrite && <CreateNew createNew={ this.postMessgae } creating={true}
          action={<FormattedMessage id="post" />} label={<FormattedMessage id="chat.message" />} multiline={true} /> }
      </div>
    </div>)
  }
}

Chat.propTypes = {
    group: PropTypes.object.isRequired,
  };
  
export default Chat;