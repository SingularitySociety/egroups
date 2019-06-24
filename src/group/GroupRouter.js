import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Header from './Header';
import { MuiThemeProvider } from '@material-ui/core';
import { red, pink, purple, deepPurple, indigo, 
         blue, lightBlue, cyan, teal, green,
         lightGreen, lime, yellow, amber, orange,
         deepOrange, brown, grey, blueGrey  } from '@material-ui/core/colors';
import { createMuiTheme } from '@material-ui/core/styles';
import { Route } from 'react-router-dom';
import GroupHome from './GroupHome';
import Events from './Events';
import MountDetector from '../common/MountDetector';
import Join from './Join';
import Account from './Account';
import Processing from '../Processing';
import Chat from './Chat';
import * as firebase from "firebase/app";
import "firebase/firestore";
import Settings from './Settings';
import Blog from './Blog';
import Articles from './Articles';
import Channels from './Channels';
import ErrorMessage from '../ErrorMessage';
import Listing from './Listing';
import Profile from './Profile';
import MemberHome from './MemberHome';
import ChannelSettings from './ChannelSettings';
import BlogSettings from './BlogSettings';

const colorMap = { red, pink, purple, deepPurple, indigo, 
  blue, lightBlue, cyan, teal, green,
  lightGreen, lime, yellow, amber, orange,
  deepOrange, brown, grey, blueGrey };

const styles = theme => ({
  root: {
    flexGrow: 1,
  },
  main: {
    width: "100%",
    padding: theme.spacing(1),
    '@media (min-width:480px)': {
      paddingTop: theme.spacing(3),
      paddingLeft: theme.spacing(5),
      paddingRight: theme.spacing(5),
      maxWidth: "50rem",
    },
  }
});

class GroupRouter extends React.Component {
  state = {group:null, member:null, error:null, pageInfo:{tabId:"home"}};
  async componentDidMount() {
    const { db, match:{params:{gp}}, rootGroup } = this.props;
    console.log(rootGroup);
    const groupName = gp || rootGroup;
    if (groupName.length < 3) {
      return;
    }

    //try {
      const data = (await db.doc("groupNames/" + groupName).get()).data();
      if (data == null) {
        this.setState({error:{key:"error.invalid.groupname", value:groupName}});
        return;
      }
      const groupId = (data && data.groupId) || groupName;
      this.refGroup = db.doc("groups/" + groupId);
      const group = (await this.refGroup.get()).data();
      group.groupId = groupId;
      group.groupName = groupName || groupId;
      //console.log("GroupHoume for "+groupName);
      this.setState({group:group, groupId:groupId});
    /*} catch(e) {
      window.location.pathname = "/";
    }*/
  }
  componentWillUnmount() {
    this.detacher && this.detacher();    
  }
  reloadGroup = async () => {
    const prev = this.state.group;
    const group = (await this.refGroup.get()).data();
    group.groupId = prev.groupId;
    group.groupName = prev.groupName;
    console.log(group);
    this.setState({group:group, groupId:prev.groupId});
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
    this.setState({member:null, history:null})
  }
  selectTab = (tabId, path) => {
    //console.log("selectTab", tabId)
    this.setState({pageInfo:{tabId, path}});
  }

  render() {
    const { classes, user, db, match:{params:{gp}}, rootGroup } = this.props;
    const groupName = gp || rootGroup;

    const { group, member, history, error, pageInfo } = this.state;
    if (error) {
      return <ErrorMessage error={error} />
    }

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
        primary: colorMap[(group.theme && group.theme.primary) || "blue"],
        secondary: colorMap[(group.theme && group.theme.primary) || "blue"],
      }
    });
    const context = { user, group, db, member, history, rootGroup, 
                      selectTab:this.selectTab, memberDidUpdate:this.memberDidUpdate, reloadGroup:this.reloadGroup };
    
    return (
      <MuiThemeProvider theme={theme}>
        { user && <MountDetector didMount={this.userDidMount} willUnmount={this.userWillUnmount}/> }
        <Header {...context} pageInfo={pageInfo} />
        <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
            <Grid item className={classes.main}>
              {
                rootGroup &&
                  <Route exact path={`/`} render={(props) => <GroupHome {...props} {...context} />} />
              }
              <Route exact path={`/${group.groupName}`} render={(props) => <GroupHome {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/member`} render={(props) => <MemberHome {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/events`} render={(props) => <Events {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/listing`} render={(props) => <Listing {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/join`} render={(props) => <Join {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/account`} 
                render={(props) => <Account {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/settings`} 
                render={(props) => <Settings {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/channels`} render={(props) => <Channels {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/ch/:channelId`} render={(props) => <Chat {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/ch/:channelId/settings`} render={(props) => <ChannelSettings {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/pr/:userId`} render={(props) => <Profile {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/blog`} render={(props) => <Articles {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/bl/:articleId`} render={(props) => <Blog {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/bl/:articleId/settings`} render={(props) => <BlogSettings {...props} {...context} />} />
            </Grid>
        </Grid>
      </MuiThemeProvider>
    );
  }
}

GroupRouter.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GroupRouter);
