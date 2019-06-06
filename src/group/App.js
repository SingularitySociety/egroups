import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import { Typography, MuiThemeProvider } from '@material-ui/core';
import theme from '../theme';
import themeBar from './themeBar';
import themeFoo from './themeFoo';

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
  state = {group:{}};
  componentDidMount() {
    const { match:{params:{groupId}} } = this.props;
    const group = {
      groupId:groupId,
      theme: (groupId==="foo") ? themeFoo : themeBar,
      title: (groupId==="foo") ? "Singularity Society" : "Fire Start Up",
    }
    this.setState({group:group});
  }

  render() {
    const { classes, user, match:{params:{groupId}} } = this.props;
    const { group } = this.state;
    return (
      <MuiThemeProvider theme={(group && group.theme) || theme}>
        <Header user={user} groupId={groupId} group={group} />
        <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
            <Grid className={classes.caption}>
            <Typography component="h2" variant="h5" gutterBottom>
              Welcome to Group Home! 
            </Typography>
            </Grid>
        </Grid>
      </MuiThemeProvider>
    );
  }
}

GroupHome.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GroupHome);
