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

function ErrorInline(props) {
  const { classes, message } = props;
  return <React.Fragment>{
    message &&     
    <Typography className={classes.errorMessage} >
      { message }
    </Typography>
  }</React.Fragment>
}

ErrorInline.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ErrorInline);
