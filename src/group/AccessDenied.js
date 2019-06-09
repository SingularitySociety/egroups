import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
});

class AccessDenied extends React.Component {
  render() {
    return (
      <Typography component="h2" variant="h5" gutterBottom>
        Access Denied
      </Typography>
    )
  }
}

AccessDenied.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(AccessDenied);