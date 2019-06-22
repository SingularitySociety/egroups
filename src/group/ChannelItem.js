import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Paper } from '@material-ui/core';
import ChatIcon from '@material-ui/icons/ChatBubble';
import { Link } from 'react-router-dom';


const styles = theme => ({
  root: {
    marginBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
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

class ChannelItem extends React.Component {
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
      <Paper className={classes.root}>
        <Grid container spacing={1}>
          <Grid item><ChatIcon /></Grid>
          <Grid item component={Link} to={`/${group.groupName}/ch/${channel.channelId}`} className={className}>{ channel.title }</Grid>
        </Grid>
      </Paper>
    )
  }
}

ChannelItem.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(ChannelItem);