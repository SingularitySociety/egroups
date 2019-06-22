import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ChannelItem from './ChannelItem';

const styles = theme => ({
});

class ChannelList extends React.Component {
  state = { list:[] }
  componentDidMount() {
    const { db, group } = this.props;
    this.detacher = db.collection(`groups/${group.groupId}/channels`).orderBy("created", "desc").onSnapshot((snapshot) => {
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
  render() {
    const { group, history } = this.props;
    return <div>
      <div>
        {
          this.state.list.map((channel)=>{
            return <ChannelItem key={channel.channelId} channel={channel} group={group} history={history} />
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