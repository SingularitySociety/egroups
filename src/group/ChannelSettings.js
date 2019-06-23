import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
});

class ChannelSettings extends React.Component {
    render() {
        return (
            <Typography component="h2" variant="h5" gutterBottom>
              ChannelSettings
            </Typography>
          )
    }
}

ChannelSettings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(ChannelSettings);