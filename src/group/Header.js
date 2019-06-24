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
  join: {
    marginTop: theme.spacing(1),
  }
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
    this.cramChannels = this.breadCram("channels");
    this.cramEvents = this.breadCram("events");
    this.cramAccount = this.breadCram("account");
    this.cramSettings = this.breadCram("settings");
    this.cramListing = this.breadCram("listing");
    this.cramJoin = this.breadCram("join", null, "application");
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
    const { classes, user, group, member, rootGroup, pageInfo } = this.props;
    const { anchorEl } = this.state;
    const cmd = { cmd:"redirect", path:window.location.pathname };
    const loginUrl = "/a/login/cmd/"+encodeURIComponent(JSON.stringify(cmd));

    let tabs = []; 
    let crams = [];
    switch(pageInfo.tabId) {
      case "home":
        tabs = [this.tabHome, this.tabMemberOnly];
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
      case "join":
        crams = [this.cramHomePage, this.cramJoin];
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
            <Typography variant="h6" color="inherit" className={classes.grow} >
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
            member && 
            <MenuItem onClick={this.closeMe} component={Link} to={`/${group.groupName}/account`}><FormattedMessage id="account" /></MenuItem>
          }
          {
            member && 
            <MenuItem onClick={this.closeMe} component={Link} to={`/${group.groupName}/listing`}><FormattedMessage id="listing" /></MenuItem>
          }
          {
            (member && member.privilege >= Privileges.admin) && 
            <MenuItem onClick={this.closeMe} component={Link} to={`/${group.groupName}/settings`}><FormattedMessage id="settings" /></MenuItem>
          }
          <Divider />
            <MenuItem onClick={this.logout}><FormattedMessage id="logout" /></MenuItem>
        </Menu>
        { subbar }
        {
          !member && pageInfo.tabId!=="join" && 
            <Grid container justify="center" className={classes.join}>
              <Grid item>
                <Button variant="contained" color="primary" component={Link} to={"/" + group.groupName + "/join"}><FormattedMessage id="join" /></Button>
              </Grid>
            </Grid>
        }
      </div>
    );
  }
}

MyAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAppBar);