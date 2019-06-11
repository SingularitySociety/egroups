import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { AppBar, Toolbar, Typography, Button, IconButton, Menu, MenuItem } from '@material-ui/core';
import { Drawer, List, Divider, ListItem, ListItemIcon, ListItemText } from '@material-ui/core';
import MenuIcon from '@material-ui/icons/Menu';
import AccountIcon from '@material-ui/icons/AccountCircle';
import HomeIcon from '@material-ui/icons/Home';
import InfoIcon from '@material-ui/icons/Info';
import { Link } from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/auth";

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
};

class MyAppBar extends React.Component {
  state = {
    drawer: false,
    anchorEl: null,
  };
  openMe = e => {
    this.setState({anchorEl:e.currentTarget})
  }
  closeMe = () => {
    this.setState({anchorEl:null});
  }
  handleMenu = event => {
    this.setState({drawer:true});
  };
  handleClose = () => {
    this.setState({drawer:false});
  };
  logout = event => {
    this.closeMe();
    console.log("logout");
    firebase.auth().signOut();
  };

render() {
    const { classes, user, group, member } = this.props;
    const { anchorEl } = this.state;
    const cmd = { cmd:"redirect", path:window.location.pathname };
    const loginUrl = "/a/login/cmd/"+encodeURIComponent(JSON.stringify(cmd));

    return (
      <div className={classes.root}>
        <AppBar position="static">
          <Toolbar>
            <IconButton className={classes.menuButton} onClick={this.handleMenu} color="inherit" aria-label="Menu">
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" color="inherit" className={classes.grow}>
              {group.title}
            </Typography>
            {
              member ?
              <IconButton color="inherit" onClick={this.openMe}><AccountIcon /></IconButton>
              : <Button color="inherit" component={Link} to={"/" + group.groupName + "/join"}>Join</Button>
            }
            {
                !user && <Button color="inherit" to={loginUrl} component={Link}>Login</Button>
            }
          </Toolbar>
        </AppBar>
        <Menu anchorEl={anchorEl} keepMounted open={Boolean(anchorEl)} onClose={this.closeMe}>
          <MenuItem onClick={this.closeMe} component={Link} to={`/${group.groupName}/account`}>Account</MenuItem>
          <MenuItem onClick={this.logout}>Logout</MenuItem>
        </Menu>
        <Drawer open={this.state.drawer} onClose={this.handleClose}>
          <List>
            <ListItem button onClick={this.handleClose} to={"/"} component={Link}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Exit" />
            </ListItem>
            <ListItem button onClick={this.handleClose} to={"/"+group.groupName} component={Link}>
              <ListItemIcon><HomeIcon /></ListItemIcon>
              <ListItemText primary="Group Home" />
            </ListItem>
            <Divider />
            <ListItem button onClick={this.handleClose} to={"/"+group.groupName+"/about"} component={Link}>
              <ListItemIcon><InfoIcon /></ListItemIcon>
              <ListItemText primary="About" />
            </ListItem>
          </List>
        </Drawer>
      </div>
    );
  }
}

MyAppBar.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(MyAppBar);