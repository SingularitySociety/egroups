import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import { Typography } from '@material-ui/core';
import GroupList from './GroupList';


const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1),
  },
  main: {
    width:"calc(80vmin)",
    marginTop: theme.spacing(3),
  },
  caption: {
    width: "100%",
  },
});

function ComplexGrid(props) {
  const { classes, user, db } = props;
  return (
    <React.Fragment>
      <Header user={user} />
      <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
        <Grid item className={classes.main}>
          <Typography style={{marginBottom:"5%"}}>
            このサービスは、現在、ベータテスト中です。
          </Typography>
          <GroupList user={user} db={db} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

ComplexGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ComplexGrid);
