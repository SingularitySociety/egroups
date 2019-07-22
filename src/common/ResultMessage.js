import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  message: {
    marginTop: theme.spacing(1),
  },
});

function ResultMessage(props) {
  const { classes, error, message } = props;
  return <React.Fragment>
    {
      error &&     
      <Typography color="error" className={classes.message} >
        { error }
      </Typography>
    }
    {
      message &&     
      <Typography color="primary" className={classes.message} >
        { message }
      </Typography>
    }
  </React.Fragment>
}

ResultMessage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ResultMessage);
