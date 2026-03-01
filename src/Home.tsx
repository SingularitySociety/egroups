import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import { Typography } from '@material-ui/core';
import GroupList from './GroupList';
import NewGroupButton from './NewGroupButton';
import { FormattedMessage } from 'react-intl';

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
  const { classes, user, db, privileges } = props;
  return (
    <React.Fragment>
      <Header user={user} />
      <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
        <Grid item className={classes.main}>
          <Typography color="error" style={{marginBottom:"5%"}}>
            <img src="/gluepasslogo.png" style={{width: "100%"}}/><br/>
            <FormattedMessage id="underconstruction.service" />
          </Typography>
          {
            user && <NewGroupButton user={user} db={db} />
          }
          <GroupList user={user} db={db} groupIds={privileges ? Object.keys(privileges) : []}/>
          <Typography component="h2" variant="h3"><FormattedMessage id="groups.subs" /></Typography>
          <GroupList user={user} db={db} filter={(q)=>{return q.where("subscription", "==", true)}} />
          <Typography component="h2" variant="h3"><FormattedMessage id="groups.free" /></Typography>
          <GroupList user={user} db={db} filter={(q)=>{return q.where("subscription", "==", false)}} />
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Home);
