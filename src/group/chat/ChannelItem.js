import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid, Paper } from '@material-ui/core';
import ChatIcon from '@material-ui/icons/ChatBubble';
import { Link } from 'react-router-dom';
import MUILink from '@material-ui/core/link';

const styles = theme => ({
  root: {
    marginBottom: theme.spacing(1),
    paddingTop: theme.spacing(1),
    paddingLeft: theme.spacing(1),
  },
  read: {
    color: "#000000",
  },
  unread: {
    color: "#000000",
    fontWeight: "bold",
  }
});

class ChannelItem extends React.Component {
  render() {
    const { classes, channel, group, history } = this.props;
    let className = classes.unread;
    if (!channel.updated || !history) {
      //console.log("case 1", channel.updated, history);
      className = classes.read;
    } else if (history.channels) {
      //console.log("case 2");
      const access = history.channels[channel.channelId];
      if (access && access.l > channel.updated) {
        className = classes.read;
      }
    }
    return (
      <Paper className={classes.root}>
        <MUILink component={Link} to={`/${group.groupName}/ch/${channel.channelId}`} >
          <Grid container spacing={1}>
            <Grid item><ChatIcon /></Grid>
            <Grid item className={className}>{ channel.title }</Grid>
          </Grid>
        </MUILink>
      </Paper>
    )
  }
}

ChannelItem.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(ChannelItem);