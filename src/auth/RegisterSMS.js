import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  root: {
    marginTop: theme.spacing(1),
  },
});

function RegisterSMS(props) {
  const { classes } = props;
  return <div className={classes.root}>
    <Typography >
      Phone Number
    </Typography>
  </div>
}

RegisterSMS.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RegisterSMS);
