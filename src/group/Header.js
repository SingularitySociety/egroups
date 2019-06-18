import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import MULink from '@material-ui/core/Link';
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
    this.tabMember = <Tab key="member" label={<FormattedMessage id="home" />} to={"/"+group.groupName + "/member"} component={Link} />;
    this.tabMemberOnly = <Tab key="member" label={<FormattedMessage id="page.member" />} to={"/"+group.groupName + "/member"} component={Link} />;
    this.tabHome = <Tab key="home" label={<FormattedMessage id="page.home" />} to={"/"+group.groupName} component={Link} />;
    this.tabChannels = <Tab key="channels" label={<FormattedMessage id="channels" />} to={"/"+group.groupName+"/channels"} component={Link} />;
    this.tabBlog = <Tab key="blog" label={<FormattedMessage id="blog" />} to={"/"+group.groupName+"/blog"} component={Link} />;
    this.tabEvents = <Tab key="events" label={<FormattedMessage id="events" />} to={"/"+group.groupName+"/events"} component={Link} />;
    this.cramHome = <MULink key="home" color="inherit" component={Link} to={`/${group.groupName}/member`}>
            <FormattedMessage id="home" />
          </MULink>;
    this.cramBlog = <MULink key="blog" color="inherit" component={Link} to={`/${group.groupName}/blog`}>
            <FormattedMessage id="blog" />
          </MULink>;
    this.cramChannels = <MULink key="channels" color="inherit" component={Link} to={`/${group.groupName}/channels`}>
            <FormattedMessage id="channels" />
          </MULink>;
    this.cramEvents = <MULink key="events" color="inherit" component={Link} to={`/${group.groupName}/events`}>
            <FormattedMessage id="events" />
          </MULink>;
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
        break;
      case "member":
        tabs = [this.tabMember, this.tabChannels, this.tabBlog, this.tabEvents];
        break;
      case "blog":
        crams = [this.cramHome, this.cramBlog];
        break;
      case "channels":
        crams = [this.cramHome, this.cramChannels];
        break;
      case "events":
        crams = [this.cramHome, this.cramEvents];
        break;
      default:
        console.log("### unknown tabId", tabId);
        break;
    }
    const subbar = (tabs.length > 0) ?
        <Tabs value={0} indicatorColor="primary" textColor="primary" centered >
          { tabs }
        </Tabs>
        : <Breadcrumbs aria-label="Breadcrumb">
          { crams }
        </Breadcrumbs>;

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