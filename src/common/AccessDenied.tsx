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

function AccessDenied(props) {
  const classes = useStyles();
  const {error} = props;
  console.log("error:", error);
  return (
    <Typography component="h1" variant="h1" gutterBottom　className={ classes.errorMessage} >
      <FormattedMessage id="warning.access.denied" />
    </Typography>
  );
}

AccessDenied.propTypes = {
  };
  
export default AccessDenied;
