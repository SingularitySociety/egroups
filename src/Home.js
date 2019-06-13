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
        <Grid item style={{width:"calc(80vmin)"}}>
          <Typography style={{marginBottom:"5%"}}>
            ベータテスト中です。
          </Typography>
          <Grid className={classes.caption}>
            <Typography component="h2" variant="h5" gutterBottom>
              Registered Communities. 
            </Typography>
            <GroupList user={user} db={db} />
          </Grid>
        </Grid>
      </Grid>
    </React.Fragment>
  );
}

ComplexGrid.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(ComplexGrid);
