import React, { useEffect } from 'react';
//import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
//import { Typography } from '@material-ui/core';
//import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1),
  },
});

const useStyles = makeStyles(styles);

function SettingsBilling(props) {
  const classes = useStyles();

  useEffect(()=>{
    console.log("useEffect");
  }, []);

  return (
    <React.Fragment>
      <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
        billing
      </Grid>
    </React.Fragment>
  );
}

SettingsBilling.propTypes = {
};

export default SettingsBilling;
