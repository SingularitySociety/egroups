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
import useDocument from '../../common/useDocument';

function Chat(props) {
  const { db, group, user, member, match:{params:{channelId}}, callbacks, profiles, privilege } = props;
  const refMessages = db.collection(`groups/${group.groupId}/channels/${channelId}/messages`);
  const setTabbar = callbacks.setTabbar;
  const [channel, err] = useDocument(db, `groups/${group.groupId}/channels/${channelId}`);

  useEffect(()=> {
    setTabbar("channel", `ch/${channelId}`);
  }, [setTabbar, channelId]);

  const postMessgae = async (message) => {
    await refMessages.add({
      created: new Date(), // firebase.firestore.FieldValue.serverTimestamp(),
      message,
      userId: user.uid,
      userName: member.displayName
    });
  }

  if (err) {
    return <ErrorMessage error={{ key: "warning.access.denied", channelId:channelId }} />
  }
  if (!channel) {
    return "";
  }
  const userId = (user && user.uid) || null;
  const canRead = privilege >= channel.read;
  const canWrite = privilege >= channel.write;
  const canEdit = userId === channel.owner || privilege >= Privileges.admin;  
  if (!canRead) {
    return <AccessDenied />
  }
  const context = { group, profiles, callbacks, channel, user, db };
  return (<div>
      <Grid container>
        <Grid item xs={canEdit ? 11 : 12}>
          <Typography component="h1" variant="h1" gutterBottom>
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