import React from 'react';
//import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  errorMessage: {
    color: "#ff8000",
  }
});

const useStyles = makeStyles(styles);

function AccessDenied() {
  const classes = useStyles();
  return (
    <Typography component="h1" variant="h1" gutterBottom　className={ classes.errorMessage} >
      <FormattedMessage id="warning.access.denied" />
    </Typography>
  )
}

AccessDenied.propTypes = {
  };
  
export default AccessDenied;