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
import User from './User';
import Join from './Join';
import Account from './Account';

const colorMap = { blue, pink, red, green};

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1),
    paddingTop: theme.spacing(3),
  },
  main: {
    width: theme.spacing(98),
  }
});

class GroupHome extends React.Component {
  state = {group:null, member:null};
  async componentDidMount() {
    const { db, match:{params:{groupName}} } = this.props;
    if (groupName.length < 3) {
      return;
    }

    //try {
      const groupId = (await db.doc("groupNames/" + groupName).get()).data().groupId;
      this.refGroup = db.doc("groups/" + groupId);
      const group = (await this.refGroup.get()).data();
      group.groupId = groupId;
      console.log("GroupHoume for "+groupName);
      this.setState({group:group, groupId:groupId});
    /*} catch(e) {
      window.location.pathname = "/";
    }*/
  }

  memberDidUpdate = async () => {
    const { user, db } = this.props;
    console.log("memberDidUpdate", user && user.uid);
    const { group } = this.state;
    const member = (await this.refGroup.collection("members").doc(user.uid).get()).data();
    if (member) {
      const privilege = (await db.doc(`groups/${group.groupId}/privileges/${user.uid}`).get()).data();
      member.privilege = (privilege && privilege.value) || 1;
    }
    console.log("member:", member);
    this.setState({member:member})
  }
  userDidMount = () => {
    this.memberDidUpdate();
  }
  userWillUnmount = () => {
    console.log("userWillUnmount");
    this.setState({member:null})
  }

  render() {
    const { classes, user, db } = this.props;
    const { group, member } = this.state;
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
        { user && <User user={user} db={db} group={group} userDidMount={this.userDidMount} userWillUnmount={this.userWillUnmount}/> }
        <Header user={user} groupId={group.groupId} group={group} login={loginUrl} member={member}/>
        <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
            <Grid item className={classes.main}>
              <Route exact path={`/${group.groupName}`} render={(props) => <Home {...props} {...params} />} />
              <Route exact path={`/${group.groupName}/about`} render={(props) => <About {...props} {...params} />} />
              <Route exact path={`/${group.groupName}/join`} render={(props) => <Join {...props} {...params} memberDidUpdate={this.memberDidUpdate} />} />
              <Route exact path={`/${group.groupName}/account`} render={(props) => <Account {...props} {...params} memberDidUpdate={this.memberDidUpdate} />} />
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
