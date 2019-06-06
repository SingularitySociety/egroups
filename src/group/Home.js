import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import { Typography, Button } from '@material-ui/core';
import { Link } from 'react-router-dom';
import theme from './theme';

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

class GroupHome extends React.Component {
  componentDidMount() {
    const { joinGroup } = this.props;
    joinGroup({theme:theme});
  }

  render() {
    const { classes, user } = this.props;
    return (
      <React.Fragment>
        <Header user={user} />
        <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
            <Grid className={classes.caption}>
            <Typography component="h2" variant="h5" gutterBottom>
              Welcome to Firebase Starter Kit! 
            </Typography>
            </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

GroupHome.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GroupHome);
