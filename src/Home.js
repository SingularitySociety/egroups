import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import { Typography } from '@material-ui/core';
import GroupList from './GroupList';
import NewGroupButton from './NewGroupButton';

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

function Home(props) {
  const { classes, user, db } = props;
  return (
    <React.Fragment>
      <Header user={user} />
      <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
        <Grid item className={classes.main}>
          <Typography style={{marginBottom:"5%"}}>
            このサービスは、現在、開発中です。
          </Typography>
          <NewGroupButton user={user} db={db} />
          <GroupList user={user} db={db} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
