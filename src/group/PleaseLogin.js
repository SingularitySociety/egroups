import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';


const styles = theme => ({
  about: {
  },
});
const useStyles = makeStyles(styles);

function PleaseLogin(props) {
  const classes = useStyles();
  return (
      <Typography className={classes.about}>
        <FormattedMessage id="login.please" />
      </Typography>
  )
}

PleaseLogin.propTypes = {
  ///classes: PropTypes.object.isRequired,
};
  
export default PleaseLogin;