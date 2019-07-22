import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  errorMessage: {
    marginTop: theme.spacing(1),
    color: "red",
  },
  message: {
    marginTop: theme.spacing(1),
    color: theme.palette.primary[500],
  },
});

function ResultMessage(props) {
  const { classes, error, message } = props;
  return <React.Fragment>
    {
      error &&     
      <Typography className={classes.errorMessage} >
        { error }
      </Typography>
    }
    {
      message &&     
      <Typography className={classes.message} >
        { message }
      </Typography>
    }
  </React.Fragment>
}

ResultMessage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ResultMessage);
