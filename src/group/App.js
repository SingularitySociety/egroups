import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import { MuiThemeProvider } from '@material-ui/core';
import { blue, pink, red, green } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import { Route } from 'react-router-dom';
import Home from './Home';
import About from './About';


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

    const groupId = (await db.doc("groupNames/" + groupName).get()).data().groupId;
    const group = (await db.doc("groups/" + groupId).get()).data();
    group.groupId = groupId;
    console.log("GroupHoume for "+groupName);
    this.setState({group:group, groupId:groupId});
  }

  render() {
    const { classes, user, db } = this.props;
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
    const params = { user, group, db };
    const cmd = { cmd:"redirect", path:window.location.pathname };
    const str = JSON.stringify(cmd);
    const loginUrl = "/a/login/cmd/"+encodeURIComponent(str);
    
    return (
      <MuiThemeProvider theme={theme}>
        <Header user={user} groupId={group.groupId} group={group} login={loginUrl} />
        <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
            <Grid className={classes.caption}>
              <Route exact path={`/${group.groupName}`} render={(props) => <Home {...props} {...params} />} />
              <Route exact path={`/${group.groupName}/about`} render={(props) => <About {...props} {...params} />} />
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
