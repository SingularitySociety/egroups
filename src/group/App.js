import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import { Typography, MuiThemeProvider } from '@material-ui/core';
import { blue, pink, red, green } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';

const colorMap = { blue, pink, red, green};

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
  state = {group:null};
  async componentDidMount() {
    const { db, match:{params:{groupName}} } = this.props;
    if (groupName.length < 3) {
      return;
    }

    const snap2 = await db.doc("groupNames/" + groupName).get();
    console.log(snap2);
    const groupId = snap2.data().groupId;
    console.log("groupId$$"+groupId+"$$");
    const snapshot = await db.doc("groups/" + groupId).get();
    console.log(snapshot);
    const group = snapshot.data();
    console.log(group)
    group.groupId = groupId;

    /*
    // HACK
    const group = {
      groupId:groupId,
      theme: (groupId==="foo") ? themeFoo : themeBar,
      title: (groupId==="foo") ? "Singularity Society" : "Fire Start Up",
    }
    */
    this.setState({group:group, groupId:groupId});
  }

  render() {
    const { classes, user } = this.props;
    const { group } = this.state;
    if (!group) {
      return null;
    }
    const theme = createMuiTheme({
      typography: {
          useNextVariants: true,
      },
      palette: {
        primary: colorMap[group.theme.primary],
        secondary: colorMap[group.theme.primary],
      }
    });
    return (
      <MuiThemeProvider theme={theme}>
        <Header user={user} groupId={group.groupId} group={group} />
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
