import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';
import Header from './Header';
import Grid from '@material-ui/core/Grid';
import * as firebase from "firebase/app";
import "firebase/functions";

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1),
    paddingTop: theme.spacing(10),
  },
  caption: {
    textAlign: "center",
    width: "100%",
  },
});

const Admin = props => {
  const { classes, user } = props;

  useEffect(()=>{
    async function store() {
      const context = {};
      const storeZenginData = firebase.functions().httpsCallable('storeZenginData');
      const result = (await storeZenginData(context)).data;
      console.log(result);
    }
    store();
  }, []);

  return (
    <React.Fragment>
      <Header user={user} login="/Login/target/admin" />
      <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
          <Grid className={classes.caption}>
          <Typography component="h1" variant="h1" gutterBottom>
            Admin. 
          </Typography>
          </Grid>
      </Grid>
    </React.Fragment>
  );
}

Admin.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Admin);
