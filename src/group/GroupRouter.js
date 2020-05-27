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
import GroupHome from './blog/GroupHome';
import Events from './Events';
import MountDetector from '../common/MountDetector';
import Account from './profile/Account';
import ProcessingPage from '../ProcessingPage';
import Chat from './chat/Chat';
import * as firebase from "firebase/app";
import "firebase/firestore";
import Settings from './Settings';
import Login from '../Login';
import Blog from './blog/Blog';
import Articles from './blog/Articles';
import Channels from './chat/Channels';
import ErrorPage from '../ErrorPage';
import Listing from './profile/Listing';
import Profile from './profile/Profile';
import MemberHome from './MemberHome';
import ChannelSettings from './chat/ChannelSettings';
import ArticleSettings from './blog/ArticleSettings';
import Join from './join/Join';
import SettingsBilling from './join/SettingsBilling';
import Subscribe from './join/Subscribe';
import Privileges from '../const/Privileges';
import Invite from './join/Invite';
import Invited from './join/Invited';
import PaymentLog from './payment/Log';
import AccountPaymentLog from './profile/PaymentLog';
import PaymentIntents from './payment/PaymentIntents';
import PayoutLog from './payment/PayoutLog';
import PaymentUpdate from './payment/Update';
import {themeOptions} from '../theme.js';
import CustomAccount from './join/CustomAccount';

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
  },
  footerSpace: {
    width: "100%",
    position: "relative",
    height: "200px",
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
    // console.log("member", user && user.uid);
    const { group, profiles } = this.state;
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    const member = (await refMember.get()).data();
    if (member) {
      profiles[user.uid] = member;
      await refMember.set({lastAccessed:firebase.firestore.FieldValue.serverTimestamp()}, {merge:true});
      if (!this.detatcher) {
        this.detacher = db.doc(`groups/${group.groupId}/members/${user.uid}/private/history`).onSnapshot((doc)=>{
          const history = doc.data();
          console.log("history=", history);
          this.setState({history});
        });
      }
    }
    this.setState({member, profiles});
  }
  userDidMount = () => {
    this.memberDidUpdate();
  }
  userWillUnmount = () => {
    console.log("userWillUnmount");
    this.setState({member:null, history:null});
  }
  setTabbar = (tabId, path) => {
    console.log("setTabbar:", tabId); // NOTE: Keep this code to detect infinit useEffect bug
    this.setState({pageInfo:{tabId, path}});
  }
  hitProfile = async (userId) => {
    const { db } = this.props;
    const { group, profiles } = this.state;
    const her = profiles[userId];
    if (!her) {
      const member = (await db.doc(`groups/${group.groupId}/members/${userId}`).get()).data();
      const { profiles } = this.state; // Get the latest one
      profiles[userId] = member;
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
      return <ErrorPage error={error} />;
    }

    if (groupName.length < 3) {
      return "";
    }
    if (!group) {
      return <ProcessingPage />;
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
    const accessControll = (requirePemission, privilege) => {
      if (requirePemission === undefined) {
        // no permission required
        return true;
      }
      if (privilege === undefined) {
        return false;
      }
      if (privilege >= requirePemission) {
        return true;
      }
      return false;
    };
    const context = { user, group, db, member, history, rootGroup, pageInfo, profiles, callbacks, privilege, accessControll };
    
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
              <Route exact path={`/g/${group.groupName}`} render={(props) => <GroupHome {...props} {...context} arp={arps.pages} />} />
              <Route exact path={`/g/${group.groupName}/member`} render={(props) => <MemberHome {...props} {...context} arps={arps} requirePemission={Privileges.member} />} />
              <Route exact path={`/g/${group.groupName}/events`} render={(props) => <Events {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/listing`} render={(props) => <Listing {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/join`} render={(props) => <Join {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/subscribe`} render={(props) => <Subscribe {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/invite`} render={(props) => <Invite {...props} {...context}  requirePemission={Privileges.admin} />} />
              <Route exact path={`/g/${group.groupName}/invite/:inviteId/:inviteKey`} render={(props) => <Invited {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/payment/log`} render={(props) => <PaymentLog {...props} {...context} requirePemission={Privileges.admin} />} />
              <Route exact path={`/g/${group.groupName}/payment/paymentintents`} render={(props) => <PaymentIntents {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/payment/payout`} render={(props) => <PayoutLog {...props} {...context} requirePemission={Privileges.admin} />} />
              <Route exact path={`/g/${group.groupName}/account`} render={(props) => <Account {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/account/payment/log`} render={(props) => <AccountPaymentLog {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/account/payment/update`} render={(props) => <PaymentUpdate {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/settings`} render={(props) => <Settings {...props} {...context} requirePemission={Privileges.admin} />} />
              <Route exact path={`/g/${group.groupName}/settings/billing`} render={(props) => <SettingsBilling {...props} {...context} requirePemission={Privileges.admin} />} />
              <Route exact path={`/g/${group.groupName}/settings/bank`}  render={(props) => <CustomAccount {...props} {...context} requirePemission={Privileges.admin} />} />
              <Route exact path={`/g/${group.groupName}/channels`} render={(props) => <Channels {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/ch/:channelId`} render={(props) => <Chat {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/ch/:channelId/settings`} render={(props) => <ChannelSettings {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/pr/:userId`} render={(props) => <Profile {...props} {...context} />} />
              <Route exact path={`/g/${group.groupName}/blog`} render={(props) => <Articles {...props} {...context} arp={arps.blog} />} />
              <Route exact path={`/g/${group.groupName}/bl/:articleId`} render={(props) => <Blog {...props} {...context} arp={arps.blog} />} />
              <Route exact path={`/g/${group.groupName}/bl/:articleId/settings`} render={(props) => <ArticleSettings {...props} {...context} arp={arps.blog} />} />
              <Route exact path={`/g/${group.groupName}/pages`} render={(props) => <Articles {...props} {...context} arp={arps.pages} />} />
              <Route exact path={`/g/${group.groupName}/pg/:articleId`} render={(props) => <Blog {...props} {...context} arp={arps.pages} />} />
              <Route exact path={`/g/${group.groupName}/pg/:articleId/settings`} render={(props) => <ArticleSettings {...props} {...context} arp={arps.pages} />} />
              <Route exact path={`/g/${group.groupName}/login/cmd/:encoded`} render={(props) => <Login {...props} disableHeader={true}/>} />
            </Grid>
        </Grid>
        <Grid className={classes.footerSpace}>
        </Grid>
      </MuiThemeProvider>
    );
  }
}

GroupRouter.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(GroupRouter);
