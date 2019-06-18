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
    this.cramHome = <MUILink key="home" color="inherit" component={Link} to={`/${group.groupName}/member`}>
            <FormattedMessage id="home" />
          </MUILink>;
    this.cramBlog = <MUILink key="blog" color="inherit" component={Link} to={`/${group.groupName}/blog`}>
            <FormattedMessage id="blog" />
          </MUILink>;
    this.cramChannels = <MUILink key="channels" color="inherit" component={Link} to={`/${group.groupName}/channels`}>
            <FormattedMessage id="channels" />
          </MUILink>;
    this.cramEvents = <MUILink key="events" color="inherit" component={Link} to={`/${group.groupName}/events`}>
            <FormattedMessage id="events" />
          </MUILink>;
    this.cramAccount = <MUILink key="account" color="inherit" component={Link} to={`/${group.groupName}/account`}>
            <FormattedMessage id="account" />
          </MUILink>;
    this.cramSettings = <MUILink key="settings" color="inherit" component={Link} to={`/${group.groupName}/settings`}>
            <FormattedMessage id="settings" />
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
    const { classes, user, group, member, rootGroup, tabId } = this.props;
    const { anchorEl } = this.state;
    const cmd = { cmd:"redirect", path:window.location.pathname };
    const loginUrl = "/a/login/cmd/"+encodeURIComponent(JSON.stringify(cmd));

    let tabs = []; 
    let crams = [];
    switch(tabId) {
      case "home":
        tabs = [this.tabHome, this.tabMemberOnly];
        if (!rootGroup) {
          tabs.push(this.tabExit);
        }
        break;
      case "member":
        tabs = [this.tabMember, this.tabChannels, this.tabBlog, this.tabEvents];
        break;
      case "blog":
        crams = [this.cramHome, this.cramBlog];
        break;
      case "article":
        crams = [this.cramHome, this.cramBlog];
        break;
      case "channels":
        crams = [this.cramHome, this.cramChannels];
        break;
      case "chat":
        crams = [this.cramHome, this.cramChannels];
        break;
      case "events":
        crams = [this.cramHome, this.cramEvents];
        break;
      case "account":
        crams = [this.cramHome, this.cramAccount];
        break;
      case "settings":
        crams = [this.cramHome, this.cramSettings];
        break;
      default:
        console.log("### unknown tabId", tabId);
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
              <IconButton color="inherit" onClick={this.openMe}><MenuIcon /></IconButton>
            }
            {
                !user && <Button color="inherit" to={loginUrl} component={Link}><FormattedMessage id="login" /></Button>
            }
          </Toolbar>
        </AppBar>
        <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={this.closeMe}>
          {
            member && 
            <MenuItem onClick={this.closeMe} component={Link} to={`/${group.groupName}/account`}><FormattedMessage id="account" /></MenuItem>
          }
          {
            (member && member.privilege > Privileges.admin) && 
             <MenuItem onClick={this.closeMe} component={Link} to={`/${group.groupName}/settings`}><FormattedMessage id="settings" /></MenuItem>
          }
          <Divider />
          {
            user && 
            <MenuItem onClick={this.logout}><FormattedMessage id="logout" /></MenuItem>
          }
        </Menu>
        { subbar }
        {
          !member && tabId!=="join" && 
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