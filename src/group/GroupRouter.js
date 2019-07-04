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
import Account from './profile/Account';
import Processing from '../Processing';
import Chat from './chat/Chat';
import * as firebase from "firebase/app";
import "firebase/firestore";
import Settings from './Settings';
import Blog from './blog/Blog';
import Articles from './blog/Articles';
import Channels from './chat/Channels';
import ErrorMessage from '../ErrorMessage';
import Listing from './profile/Listing';
import Profile from './profile/Profile';
import MemberHome from './MemberHome';
import ChannelSettings from './chat/ChannelSettings';
import ArticleSettings from './blog/ArticleSettings';
import Join from './join/Join';
import SettingsBilling from './join/SettingsBilling';
import Subscribe from './join/Subscribe';
import Privileges from '../const/Privileges';
import {themeOptions} from '../theme.js';

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
// To share code between Blog Articles and Pages 
const arps = {
  blog: {
    collection: "articles",
    leaf: "bl",
    root: "blog",
    tabRoot: "articles",
    tabLeaf: "article",
  },
  pages: {
    collection: "pages",
    leaf: "pg",
    root: "pages",
    tabRoot: "pages",
    tabLeaf: "page",
  },
};

class GroupRouter extends React.Component {
  state = {group:null, member:null, error:null, profiles:{}, pageInfo:{tabId:"home"}};
  async componentDidMount() {
    const { db, match:{params:{gp}}, rootGroup } = this.props;
    //console.log(rootGroup);
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
  groupDidUpdate = async () => {
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
    const { group, profiles } = this.state;
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    const member = (await refMember.get()).data();
    if (member) {
      profiles[user.uid] = member;
      /*
      const privilege = (await db.doc(`groups/${group.groupId}/privileges/${user.uid}`).get()).data();
      member.privilege = (privilege && privilege.value) || 1;
      */
      await refMember.set({lastAccessed:firebase.firestore.FieldValue.serverTimestamp()}, {merge:true})
      if (!this.detatcher) {
        this.detacher = db.doc(`groups/${group.groupId}/members/${user.uid}/private/history`).onSnapshot((doc)=>{
          const history = doc.data();
          console.log("history=", history);
          this.setState({history});
        });
      }
    }
    this.setState({member, profiles})
  }
  userDidMount = () => {
    this.memberDidUpdate();
  }
  userWillUnmount = () => {
    console.log("userWillUnmount");
    this.setState({member:null, history:null})
  }
  setTabbar = (tabId, path) => {
    console.log("setTabbar:", tabId); // NOTE: Keep this code to detect infinit useEffect bug
    this.setState({pageInfo:{tabId, path}});
  }
  hitProfile = async (uid) => {
    const { db } = this.props;
    const { group, profiles } = this.state;
    const her = profiles[uid];
    if (!her) {
      const member = (await db.doc(`groups/${group.groupId}/members/${uid}`).get()).data();
      const { profiles } = this.state; // Get the latest one
      profiles[uid] = member;
      this.setState({profiles});
    }
    // no need to return her (use props.messages instead)
  }

  render() {
    const { classes, user, db, match:{params:{gp}}, rootGroup, privileges } = this.props;
    const groupName = gp || rootGroup;
    const { group, member, history, error, pageInfo, profiles } = this.state;
    const privilege = (privileges && group && privileges[group.groupId]) || Privileges.guest;

    if (error) {
      return <ErrorMessage error={error} />
    }

    if (groupName.length < 3) {
      return "";
    }
    if (!group) {
      return <Processing />;
    }
    const options = Object.assign({}, themeOptions);
    options.palette = {
      primary: colorMap[(group.theme && group.theme.primary) || "blue"],
      secondary: colorMap[(group.theme && group.theme.primary) || "blue"],
    };
    const theme = createMuiTheme(options);

    const callbacks = {
      setTabbar:this.setTabbar, 
      memberDidUpdate:this.memberDidUpdate, 
      groupDidUpdate:this.groupDidUpdate,
      hitProfile:this.hitProfile,
    };
    const context = { user, group, db, member, history, rootGroup, profiles, callbacks, privilege };
    
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
              <Route exact path={`/${group.groupName}`} render={(props) => <GroupHome {...props} {...context} arp={arps.pages} />} />
              <Route exact path={`/${group.groupName}/member`} render={(props) => <MemberHome {...props} {...context} arps={arps} />} />
              <Route exact path={`/${group.groupName}/events`} render={(props) => <Events {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/listing`} render={(props) => <Listing {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/join`} render={(props) => <Join {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/subscribe`} render={(props) => <Subscribe {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/account`} 
                render={(props) => <Account {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/settings`} 
                render={(props) => <Settings {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/settings/billing`} 
                render={(props) => <SettingsBilling {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/channels`} render={(props) => <Channels {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/ch/:channelId`} render={(props) => <Chat {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/ch/:channelId/settings`} render={(props) => <ChannelSettings {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/pr/:userId`} render={(props) => <Profile {...props} {...context} />} />
              <Route exact path={`/${group.groupName}/blog`} render={(props) => <Articles {...props} {...context} arp={arps.blog} />} />
              <Route exact path={`/${group.groupName}/bl/:articleId`} render={(props) => <Blog {...props} {...context} arp={arps.blog} />} />
              <Route exact path={`/${group.groupName}/bl/:articleId/settings`} render={(props) => <ArticleSettings {...props} {...context} arp={arps.blog} />} />
              <Route exact path={`/${group.groupName}/pages`} render={(props) => <Articles {...props} {...context} arp={arps.pages} />} />
              <Route exact path={`/${group.groupName}/pg/:articleId`} render={(props) => <Blog {...props} {...context} arp={arps.pages} />} />
              <Route exact path={`/${group.groupName}/pg/:articleId/settings`} render={(props) => <ArticleSettings {...props} {...context} arp={arps.pages} />} />
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
