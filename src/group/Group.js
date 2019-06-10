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
import Processing from '../Processing';
import Chat from './Chat';
import * as firebase from "firebase/app";
import "firebase/firestore";

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
  componentWillUnmount() {
    this.detacher && this.detacher();    
  }

  memberDidUpdate = async () => {
    const { user, db } = this.props;
    console.log("memberDidUpdate", user && user.uid);
    const { group } = this.state;
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    const member = (await refMember.get()).data();
    if (member) {
      const privilege = (await db.doc(`groups/${group.groupId}/privileges/${user.uid}`).get()).data();
      member.privilege = (privilege && privilege.value) || 1;
      await refMember.set({lastAccessed:firebase.firestore.FieldValue.serverTimestamp()}, {merge:true})
      if (!this.detatcher) {
        this.detacher = db.doc(`groups/${group.groupId}/members/${user.uid}/private/history`).onSnapshot((doc)=>{
          const history = doc.data();
          console.log("history=", history);
          this.setState({history});
        });
      }
    }
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
    const { classes, user, db, match:{params:{groupName}} } = this.props;
    const { group, member, history } = this.state;
    if (groupName.length < 3) {
      return "";
    }
    if (!group) {
      return <Processing />;
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
    const context = { user, group, db, member, history };
    
    return (
      <MuiThemeProvider theme={theme}>
        { user && <User {...context} userDidMount={this.userDidMount} userWillUnmount={this.userWillUnmount}/> }
        <Header {...context} />
        <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
            <Grid item className={classes.main}>
              <Route exact path={`/${group.groupName}`} render={(props) => <Home {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/about`} render={(props) => <About {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/join`} render={(props) => <Join {...props} {...context} memberDidUpdate={this.memberDidUpdate} />} />
              <Route exact path={`/${group.groupName}/account`} render={(props) => <Account {...props} {...context} memberDidUpdate={this.memberDidUpdate} />} />
              <Route exact path={`/${group.groupName}/ch/:channelId`} render={(props) => <Chat {...props} {...context} />} />
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
