import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ChannelList from './ChannelList';
import * as firebase from "firebase/app";
import Privileges from '../const/Privileges';
import { FormattedMessage } from 'react-intl';
import CreateNew from '../common/CreateNew';
import { Grid } from '@material-ui/core';


const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

class Channels extends React.Component {
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("channels");
  }
  createChannel = async (title) => {
    console.log("createChannel:", title)
    const { db, group, user } = this.props;
    db.collection(`groups/${group.groupId}/channels`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: user.uid,
      read: group.privileges.channel.read || Privileges.member, 
      write: group.privileges.channel.write || Privileges.member, 
    });
  }
  render() {
      const { user, db, member, group, history } = this.props;
      const context = { user, group, db, member, history };
      const canCreateNew = !!member && member.privilege 
              >= ((group.privileges && group.privileges.channel && group.privileges.channel.create) || 2);
      return (
        <Grid container justify="center">
          <Grid item xs={12} style={{textAlign:"center"}}>
                  { canCreateNew && <CreateNew createNew={ this.createChannel } 
                    action={<FormattedMessage id="create" />} label={<FormattedMessage id="channel" />}/> }
          </Grid>
          <Grid item xs={12}>
            <ChannelList {...context}/>
          </Grid>
        </Grid>
      )
  }
}

Channels.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Channels);
