import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import * as firebase from "firebase/app";
import "firebase/firestore";
import CreateNew from '../common/CreateNew';
import Channel from './Channel';
import { FormattedMessage } from 'react-intl';
import { Privileges } from './Privileges';

const styles = theme => ({
});

class ChannelList extends React.Component {
  state = { list:[] }
  componentDidMount() {
    const { db, group } = this.props;
    this.detacher = db.collection(`groups/${group.groupId}/channels`).orderBy("created", "desc").onSnapshot((snapshot) => {
      console.log("onSnapshot")
      const list = [];
      snapshot.forEach((doc)=>{
        const channel = doc.data();
        channel.channelId = doc.id;
        list.push(channel);
      });
      this.setState({list});
    })
  }
  componentWillUnmount() {
    this.detacher();
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
    const { member, group, history } = this.props;
    const canCreateNew = !!member && member.privilege 
            >= ((group.privileges && group.privileges.channel && group.privileges.channel.create) || 2);
    return <div>
      { canCreateNew && <CreateNew createNew={ this.createChannel } 
          action={<FormattedMessage id="create" />} label={<FormattedMessage id="channel.name" />}/> }
      <div>
        {
          this.state.list.map((channel)=>{
            return <Channel key={channel.channelId} channel={channel} group={group} history={history} />
          })
        }
      </div>
    </div>
  }
}

ChannelList.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(ChannelList);