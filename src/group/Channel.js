import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Grid } from '@material-ui/core';
import { Link } from 'react-router-dom';


const styles = theme => ({
});

class Channel extends React.Component {
  render() {
    const { channel, group } = this.props;
    return (
      <Grid container >
        <Grid item component={Link} to={`/${group.groupName}/ch/${channel.channelId}`}>{ channel.title }</Grid>
      </Grid>
    )
  }
}

Channel.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Channel);