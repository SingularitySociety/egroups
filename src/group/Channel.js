import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';


const styles = theme => ({
  read: {
    color: "#000000",
    textDecoration: "none",
  },
  unread: {
    color: "#000000",
    fontWeight: "bold",
    textDecoration: "none",
  }
});

class Channel extends React.Component {
  render() {
    const { classes, channel, group, history } = this.props;
    let className = classes.unread;
    if (!channel.updated || !history) {
      className = classes.read;
    } else if (history.channels) {
      const access = history.channels[channel.channelId];
      if (access && access.l > channel.updated) {
        className = classes.read;
      }
    }
    return (
      <Grid container >
        <Grid item component={Link} to={`/${group.groupName}/ch/${channel.channelId}`} className={className}># { channel.title }</Grid>
      </Grid>
    )
  }
}

Channel.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Channel);