import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  errorMessage: {
    marginTop: theme.spacing(1),
    color: "red",
  },
});

function ResultMessage(props) {
  const { classes, error } = props;
  return <React.Fragment>{
    error &&     
    <Typography className={classes.errorMessage} >
      { error }
    </Typography>
  }</React.Fragment>
}

ResultMessage.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ResultMessage);
