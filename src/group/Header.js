import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import { Divider, Tabs, Tab, Grid } from '@material-ui/core';
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
  join: {
    marginTop: theme.spacing(1),
  }
};

const tabIndexMap = {
  home: 0,
  chat: 1,
  blog: 2,
  events: 3,
  account: 11,
  listing: 12,
  settings: 21,
  join: 31,
  profile: 42,
}

class MyAppBar extends React.Component {
  constructor(props) {
    super(props);
    const { group } = props;
    this.state = {
      drawer: false,
      anchorEl: null,
    };
    this.tabMember = <Tab key="member" label={<FormattedMessage id="home" />} to={"/"+group.groupName + "/member"} component={Link} />;
    this.tabHome = <Tab key="home" label={<FormattedMessage id="home" />} to={"/"+group.groupName} component={Link} />;
    this.tabChannels = <Tab key="channels" label={<FormattedMessage id="channels" />} to={"/"+group.groupName+"/channels"} component={Link} />;
    this.tabBlog = <Tab key="blog" label={<FormattedMessage id="blog" />} to={"/"+group.groupName+"/blog"} component={Link} />;
    this.tabEvents = <Tab key="events" label={<FormattedMessage id="events" />} to={"/"+group.groupName+"/events"} component={Link} />;
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
    const tabIndex = tabIndexMap[tabId || "home"] || 0;

    let tabs = []; 
    //let crams = [];
    switch(tabId) {
      case "home":
        tabs = [this.tabHome, this.tabMember];
        break;
      case "member":
        tabs = [this.tabMember, this.tabChannels, this.tabBlog, this.tabEvents];
        break;
    }
    const subbar = (tabs.length > 0) ?
        <Tabs value={0} indicatorColor="primary" textColor="primary" centered >
          { tabs }
        </Tabs>
        : "";

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              {group.title}
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
          {
            !rootGroup && 
            <MenuItem onClick={this.closeMe} component={Link} to={`/`}><FormattedMessage id="exit" /></MenuItem>
          }
          <Divider />
          {
            user && 
            <MenuItem onClick={this.logout}><FormattedMessage id="logout" /></MenuItem>
          }
        </Menu>
        { subbar }
        {
          (() => {
            if (tabIndex > 40) {
              return (
                <Tabs value={tabIndex-40} indicatorColor="primary" textColor="primary" centered >
                  <Tab label={<FormattedMessage id="home" />} to={"/"+group.groupName} component={Link} />
                  <Tab label={<FormattedMessage id="listing" />} to={"/"+group.groupName+"/listing"} component={Link} />
                  <Tab label={<FormattedMessage id="profile" />} />
                </Tabs>
                )
            } else if (tabIndex > 30) {
              return (
                <Tabs value={tabIndex-30} indicatorColor="primary" textColor="primary" centered >
                  <Tab label={<FormattedMessage id="home" />} to={"/"+group.groupName} component={Link} />
                  <Tab label={<FormattedMessage id="application" />} to={"/"+group.groupName+"/join"} component={Link} />
                </Tabs>
              )
            } else if (tabIndex > 20) {
              return (
                <Tabs value={tabIndex-20} indicatorColor="primary" textColor="primary" centered >
                  <Tab label={<FormattedMessage id="home" />} to={"/"+group.groupName} component={Link} />
                  <Tab label={<FormattedMessage id="settings" />} to={"/"+group.groupName+"/settings"} component={Link} />
                </Tabs>
                )
            } else if (tabIndex > 10) {
              return (
                <Tabs value={tabIndex-10} indicatorColor="primary" textColor="primary" centered >
                  <Tab label={<FormattedMessage id="home" />} to={"/"+group.groupName} component={Link} />
                  <Tab label={<FormattedMessage id="account" />} to={"/"+group.groupName+"/account"} component={Link} />
                  <Tab label={<FormattedMessage id="listing" />} to={"/"+group.groupName+"/listing"} component={Link} />
                </Tabs>
                )
            } else {
              return (
                <Tabs value={tabIndex} indicatorColor="primary" textColor="primary" centered >
                  <Tab label={<FormattedMessage id="home" />} to={"/"+group.groupName} component={Link} />
                  <Tab label={<FormattedMessage id="channels" />} to={"/"+group.groupName+"/channels"} component={Link} />
                  <Tab label={<FormattedMessage id="blog" />} to={"/"+group.groupName+"/blog"} component={Link} />
                  <Tab label={<FormattedMessage id="events" />} to={"/"+group.groupName+"/events"} component={Link} />
                </Tabs>
                )
            }
          })()
        }
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