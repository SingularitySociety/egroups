import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
});

class Chat extends React.Component {
  state = {channel:{}}
  async componentDidMount() {
    const { db, group, match:{params:{channelId}} } = this.props;
    console.log(channelId);
    const ref = db.doc(`groups/${group.groupId}/channels/${channelId}`);
    const channel = (await ref.get()).data();
    console.log(channel);
    this.setState({channel:channel})
  }
    render() {
      const { channel } = this.state;
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