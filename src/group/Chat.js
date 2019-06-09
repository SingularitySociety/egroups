import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

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
    this.detacher = ref.collection("messages").onSnapshot((snapshot)=>{
      const messages=[];
      snapshot.forEach((doc) => {
        const message = doc.data();
        message.messageId = doc.id;
        messages.push(message);
      })
      this.setState({messages});
    });
  }

  componentWillUnmount() {
    this.detacher && this.detacher();
  }

  render() {
    const { channel } = this.state;
    const { member } = this.props;
    const canAccessChannel = ((member && member.privilege) || 0) >= ((channel && channel.privilege) || 1);
    return (
      <Typography component="h2" variant="h5" gutterBottom>
        { channel.title }
      </Typography>
    )
  }
}

Chat.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Chat);