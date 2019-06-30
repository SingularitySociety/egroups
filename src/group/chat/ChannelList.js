import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ChannelItem from './ChannelItem';
import ErrorMessage from '../ErrorMessage';

const styles = theme => ({
});

class ChannelList extends React.Component {
  state = { list:[] }
  componentDidMount() {
    const { db, group, limit } = this.props;
    let query = db.collection(`groups/${group.groupId}/channels`).orderBy("created", "desc");
    if (limit) {
      query = query.limit(limit);
    }
    this.detacher = query.onSnapshot((snapshot) => {
      const list = [];
      snapshot.forEach((doc)=>{
        const channel = doc.data();
        channel.channelId = doc.id;
        list.push(channel);
      });
      this.setState({list});
    }, (e) => {
      console.log(e);
      const error = { key: "warning.access.denied" };
      this.setState({error});
    })
  }
  componentWillUnmount() {
    this.detacher();
  }
  render() {
    const { group, history } = this.props;
    const { error } = this.state;
    if (error) {
      return <ErrorMessage error={error} />
    }
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