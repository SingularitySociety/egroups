import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ChannelList from './ChannelList';
import * as firebase from "firebase/app";
import Privileges from '../../const/Privileges';
import { FormattedMessage } from 'react-intl';
import CreateNew from '../../common/CreateNew';
import { Grid } from '@material-ui/core';


const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

function Channels(props) {
  const { user, db, member, group, history, privilege, callbacks } = props;
  const setTabbar = callbacks.setTabbar;

  useEffect(()=>{
    setTabbar("channels");
  }, [setTabbar]);

  const createChannel = async (title) => {
    console.log("createChannel", title)
    db.collection(`groups/${group.groupId}/channels`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: user.uid,
      read: group.privileges.channel.read || Privileges.member, 
      write: group.privileges.channel.write || Privileges.member, 
    });
  }

  const context = { user, group, db, member, history };
  const canCreateNew = privilege 
          >= ((group.privileges && group.privileges.channel && group.privileges.channel.create) || Privileges.member);
  return (
    <Grid container justify="center" spacing={1}>
      <Grid item xs={12} style={{textAlign:"center"}}>
        { canCreateNew && 
          <CreateNew createNew={ createChannel } 
            action={<FormattedMessage id="create" />} 
            label={<FormattedMessage id="channel" />} /> 
        }
      </Grid>
      <Grid item xs={12}>
        <ChannelList {...context}/>
      </Grid>
    </Grid>
  )
}

Channels.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Channels);
