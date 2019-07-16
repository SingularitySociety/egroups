import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import MUILink from '@material-ui/core/Link';
import { Divider, Tabs, Tab, Grid, Breadcrumbs } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import { Link } from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/auth";
import { FormattedMessage } from 'react-intl';
import Privileges from '../const/Privileges';
import theme from '../theme';
import JoinButton from './join/JoinButton';

const styles = {
  root: {
    flexGrow: 1,
  },
  grow: {
    flexGrow: 1,
  },
  menuButton: {
    marginLeft: -12,
    marginRight: 20,
  },
  breadcrums: {
    marginTop: theme.spacing(2),
  },
};

class MyAppBar extends React.Component {
  constructor(props) {
    super(props);
    const { group } = props;
    this.state = {
      drawer: false,
      anchorEl: null,
    };
    this.tabExit = <Tab key="exit" label={<FormattedMessage id="exit" />} 
                              to={`/`} component={Link} />;
    this.tabMember = <Tab key="member" label={<FormattedMessage id="home" />} 
                              to={`/${group.groupName}/member`} component={Link} />;
    this.tabMemberOnly = <Tab key="member" label={<FormattedMessage id="page.member" />} 
                              to={`/${group.groupName}/member`} component={Link} />;
    this.tabHome = <Tab key="home" label={<FormattedMessage id="page.home" />} 
                              to={`/${group.groupName}`} component={Link} />;
    this.tabChannels = <Tab key="channels" label={<FormattedMessage id="channels" />} 
                              to={`/${group.groupName}/channels`} component={Link} />;
    this.tabBlog = <Tab key="blog" label={<FormattedMessage id="blog" />} 
                              to={`/${group.groupName}/blog`} component={Link} />;
    this.tabEvents = <Tab key="events" label={<FormattedMessage id="events" />} 
                              to={`/${group.groupName}/events`} component={Link} />;
    this.cramHome = this.breadCram("home", "member", "home");
    this.cramBlog = this.breadCram("blog");
    this.cramPages = this.breadCram("pages");
    this.cramChannels = this.breadCram("channels");
    this.cramEvents = this.breadCram("events");
    this.cramAccount = this.breadCram("account");
    this.cramSettings = this.breadCram("settings");
    this.cramSettingsBilling = this.breadCram("settings.billing", "settings/billing");
    this.cramListing = this.breadCram("listing");
    this.cramJoin = this.breadCram("join", null, "application");
    this.cramSubscribe = this.breadCram("subscribe");
    this.cramInvite = this.breadCram("invite");
    this.cramHomePage = <MUILink key="page.home" color="inherit" component={Link} to={`/${group.groupName}`}>
            <FormattedMessage id="page.home" />
          </MUILink>;
  }
  breadCram = (tabId, path, label) => {
    const { group } = this.props;
    return <MUILink key={tabId} color="inherit" component={Link} to={`/${group.groupName}/${path || tabId}`}>
            <FormattedMessage id={label || tabId} />
          </MUILink>;
  }
  openMe = e => {
    this.setState({anchorEl:e.currentTarget})
  }
  closeMe = () => {
    this.setState({anchorEl:null});
  }
  logout = event => {
    this.closeMe();
    console.log("logout");
    firebase.auth().signOut();
  };

  render() {
    const { classes, user, group, rootGroup, pageInfo, privilege } = this.props;
    const { anchorEl } = this.state;
    const cmd = { cmd:"redirect", path:window.location.pathname };
    const loginUrl = "/a/login/cmd/"+encodeURIComponent(JSON.stringify(cmd));

    let tabs = []; 
    let crams = [];
    let cramHome = (privilege > 0) ? this.cramHome : this.cramHomePage;
    switch(pageInfo.tabId) {
      case "home":
        tabs = [this.tabHome];
        if (privilege > 0) {
          tabs.push(this.tabMemberOnly);
        }
        if (!rootGroup) {
          tabs.push(this.tabExit);
        }
        break;
      case "member":
        tabs = [this.tabMember, this.tabChannels, this.tabBlog, this.tabEvents];
        break;
      case "articles":
        crams = [this.cramHome, this.cramBlog];
        break;
      case "article":
        crams = [this.cramHome, this.cramBlog, this.breadCram(pageInfo.tabId, pageInfo.path)];
        break;
      case "article.settings":
        crams = [this.cramHome, this.cramBlog, this.breadCram("article", pageInfo.path),
                this.breadCram(pageInfo.tabId, pageInfo.path+"/settings")];
        break;

      case "pages":
        crams = [cramHome, this.cramPages];
        break;
      case "page":
        crams = [cramHome, this.cramPages, this.breadCram(pageInfo.tabId, pageInfo.path)];
        break;
      case "page.settings":
        crams = [this.cramHome, this.cramPages, this.breadCram("page", pageInfo.path),
                this.breadCram(pageInfo.tabId, pageInfo.path+"/settings")];
        break;
    
      case "channels":
        crams = [this.cramHome, this.cramChannels];
        break;
      case "channel":
        crams = [this.cramHome, this.cramChannels, this.breadCram(pageInfo.tabId, pageInfo.path)];
        break;
      case "channel.settings":
        crams = [this.cramHome, this.cramChannels, this.breadCram("channel", pageInfo.path),
                this.breadCram(pageInfo.tabId, pageInfo.path+"/settings")];
        break;
      case "events":
        crams = [this.cramHome, this.cramEvents];
        break;
      case "event":
        crams = [this.cramHome, this.cramEvents, this.breadCram(pageInfo.tabId, pageInfo.path)];
        break;
      case "account":
        crams = [this.cramHome, this.cramAccount];
        break;
      case "settings":
        crams = [this.cramHome, this.cramSettings];
        break;
      case "settings.billing":
          crams = [this.cramHome, this.cramSettings, this.cramSettingsBilling];
          break;
      case "join":
        crams = [this.cramHomePage, this.cramJoin];
        break;
      case "subscribe":
          crams = [this.cramHomePage, this.cramSubscribe];
          break;
      case "invite":
        crams = [this.cramHomePage, this.cramInvite];
        break;
      case "listing":
        crams = [this.cramHome, this.cramListing];
        break;
      case "profile":
        crams = [this.cramHome, this.cramListing, this.breadCram(pageInfo.tabId, pageInfo.path)];
        break;
      default:
        console.log("### unknown tabId", pageInfo.tabId);
        break;
    }
    const subbar = (tabs.length > 0) ?
        <Tabs value={0} indicatorColor="primary" textColor="primary" centered >
          { tabs }
        </Tabs>
        : 
        <Grid container justify="center">
          <Grid item className={classes.breadcrums}>
            <Breadcrumbs aria-label="Breadcrumb">
              { crams }
            </Breadcrumbs>
          </Grid>
        </Grid>;

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h4" color="inherit" className={classes.grow} >
              <MUILink color="inherit" component={Link} to={`/${group.groupName}`}>
                {group.title}
              </MUILink>
            </Typography>
            { 
              user ?
              <IconButton color="inherit" onClick={this.openMe}><MenuIcon /></IconButton>
              :
              <Button color="inherit" to={loginUrl} component={Link}><FormattedMessage id="login" /></Button>
            }
          </Toolbar>
        </AppBar>
        <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={this.closeMe}>
          {
            (privilege >= group.privileges.member.read) && 
            <MenuItem key="listing" onClick={this.closeMe} component={Link} to={`/${group.groupName}/listing`}><FormattedMessage id="listing" /></MenuItem>
          }
          {
            privilege && [
            <MenuItem key="account" onClick={this.closeMe} component={Link} to={`/${group.groupName}/account`}><FormattedMessage id="account" /></MenuItem>,
            <MenuItem key="pages" onClick={this.closeMe} component={Link} to={`/${group.groupName}/pages`}><FormattedMessage id="pages" /></MenuItem>
            ]
          }
          {
            (privilege >= Privileges.admin) && [
            <MenuItem key="invite" onClick={this.closeMe} component={Link} to={`/${group.groupName}/invite`}><FormattedMessage id="invite" /></MenuItem>,
            <MenuItem key="settings" onClick={this.closeMe} component={Link} to={`/${group.groupName}/settings`}><FormattedMessage id="settings" /></MenuItem>
            ]
          }
          <Divider />
            <MenuItem onClick={this.logout}><FormattedMessage id="logout" /></MenuItem>
        </Menu>
        { subbar }
        <JoinButton privilege={privilege} pageInfo={pageInfo} group={group} />
      </div>
    );
  }
}

MyAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAppBar);