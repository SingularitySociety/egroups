import React, { useEffect, useState } from 'react';
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

function Chat(props) {
  const [channel, setChannel] = useState(null);
  const [error, setError] = useState(null);
  const { db, group, user, member, match:{params:{channelId}}, callbacks, profiles } = props;
  const refMessages = db.collection(`groups/${group.groupId}/channels/${channelId}/messages`);
  const setTabbar = callbacks.setTabbar;

  useEffect(()=> {
    setTabbar("channel", `ch/${channelId}`);
  }, [setTabbar, channelId]);
  useEffect(()=> {
    console.log("useEffect getChannel", channelId);
    async function getChannel() {
      try {
        const ref = db.doc(`groups/${group.groupId}/channels/${channelId}`);
        const channel = (await ref.get()).data();
        channel.channelId = channelId;
        setChannel(channel);
      } catch(e) {
        console.log(e);
        const error = { key: "warning.access.denied", channelId:channelId };
        setError(error);
      }
    }
    getChannel();
  }, [channelId, db, group.groupId]);

  const postMessgae = async (message) => {
    await refMessages.add({
      created: new Date(), // firebase.firestore.FieldValue.serverTimestamp(),
      message,
      uid: user.uid,
      userName: member.displayName
    });
  }

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
  const context = { group, profiles, callbacks, channel, user, db };
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
    { canWrite && <CreateNew createNew={ postMessgae } creating={true}
        action={<FormattedMessage id="post" />} label={<FormattedMessage id="chat.message" />} multiline={true} /> }
    </div>
  </div>)
}

Chat.propTypes = {
    group: PropTypes.object.isRequired,
  };
  
export default Chat;