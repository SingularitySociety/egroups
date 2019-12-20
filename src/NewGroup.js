import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, Button, TextField, FormControl, FormLabel, List, ListItem } from '@material-ui/core';
import Header from './Header';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import Privileges from './const/Privileges';
import CircularProgress from '@material-ui/core/CircularProgress';
import * as firebase from "firebase/app";
import "firebase/functions";

const styles = theme => ({
  root: {
    flexGrow: 1,
    padding: theme.spacing(1),
    paddingTop: theme.spacing(3),
  },
  button: {
    margin: theme.spacing(1),
  },
  textField: {
    marginRight: theme.spacing(1),
  },
  formControl: {
    width:"100%",
    marginTop: theme.spacing(1),
  },
});

const groupTypeKeys = ["group.free.open", "group.free.closed", "group.paid.open", "group.paid.closed"];
const groupTypes = [
  { open:true, subscription:false },
  { open:false, subscription:false },
  { open:true, subscription:true },
  { open:false, subscription:true },
]

class NewGroup extends React.Component {
  state = { title:"", path:"", invalid:true, conflict:false, processing:false, groupType:-1 };

  async componentDidMount() {
    console.log(window.location);
    const { db, match:{params:{groupId}} } = this.props;
    const doc = (await db.doc(`groups/${groupId}`).get()).data();
    if (doc) {
      this.setState({title:doc.title});
    }
  }

  onSubmit = async (e) => {
    e.preventDefault();
    console.log("onSubmit");
    const { match:{params:{groupId}} } = this.props;
    const { path, title, groupType } = this.state;
    const context = { groupId, path, title, types:groupTypes[groupType] };
    console.log(context);
    this.setState({processing:true});
    const createGroupName = firebase.functions().httpsCallable('createGroupName');
    const result = (await createGroupName(context)).data;
    if (result.result) {
      // BUGBUG: For some reason, redirect does not work (infinit spiral)
      //  this.setState({redirect:`/g/${path}`});
      window.location.pathname = `/g/${path}`;
    } else {
      this.setState({processing:false});
      console.log(result);
    }
  }
  onCancel = async (e) => {
    e.preventDefault();
    const { db, match:{params:{groupId}} } = this.props;
    console.log("onCancel", groupId);
    await db.doc(`groups/${groupId}`).delete();
    this.setState({redirect:"/"});
  }
  handleChange = name => async event => {
    this.setState({ [name]: event.target.value });
    if (name==="path") {
      const { db } = this.props;
      const path = event.target.value;
      const regex = /^\w+$/
      const invalid = !(path.length >= 6 && regex.test(path));
      this.setState({invalid, conflict:false});
      if (invalid) {
        return; // no need to check the conflict
      }
      const doc = await db.doc(`groupNames/${path}`).get();
      if (path !== this.state.path) {
        // The user is typing too fast. Ignore
        return;
      }
      if (doc.exists) {
        this.setState({invalid:true, conflict:true});
      }
    }
  };
  onGroupType = (groupType) => {
    this.setState({groupType});
  }

  render() {
    const { classes, user, privileges, match:{params:{groupId}} } = this.props;
    const { redirect, title, path, invalid, conflict, processing, groupType } = this.state;
    if (redirect) {
      return <Redirect to={ redirect } />;
    }
    const privilege = privileges && privileges[groupId];
    const isOwner = privilege === Privileges.owner; // becomes true when we got JWT
    const disabledSubmit = invalid || !isOwner || groupType<0;
    const descriptions = groupTypeKeys.map((key, index)=>{
      return <ListItem button key={key} selected={index===groupType} onClick={()=>{this.onGroupType(index)}}>
        <Grid container direction="row">
          <Grid item xs={12}>
          <Typography style={{fontWeight:"bold"}}><FormattedMessage id={key} /></Typography>
          </Grid>
          <Grid item xs={12}>
          <Typography><FormattedMessage id={`${key}.desc`} /></Typography>
          </Grid>
        </Grid> 
      </ListItem>
    });
    console.log(groupType);
    return (
      <React.Fragment>
        <Header user={user} />
        <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
          <Grid item style={{width:"calc(80vmin)"}}>
            <Typography component="h2" variant="h6" gutterBottom>
              <FormattedMessage id="new.group" />
            </Typography>
            <form className={classes.form}>
              <FormControl className={classes.formControl}>
              <TextField label={<FormattedMessage id="group.title" />} value={title} 
                  onChange={this.handleChange('title')} className={classes.textField} margin="normal" />
              </FormControl>
              <br/>
              <br/>
              <FormControl>
                <FormLabel><FormattedMessage id="group.choose.type" /></FormLabel>
                <List>
                  { descriptions }
                </List>
              </FormControl>              
              <br/>
              <FormControl className={classes.formControl}>
              <TextField label={<FormattedMessage id={conflict ? "path.conflict" : "group.path"} />} value={path} autoFocus={true} error={ invalid }
                  onChange={this.handleChange('path')} className={classes.textField} margin="normal" />
              <span>URL: {`https:/${window.location.host}/g/${path || "..."}`}</span>
              </FormControl>
              <div>
                { processing ?
                  <CircularProgress />
                :
                  <React.Fragment>
                    <Button variant="contained" color="primary" className={classes.button} disabled={ disabledSubmit }
                      onClick={this.onSubmit} type="submit"><FormattedMessage id="create" /></Button>
                    <Button variant="contained" className={classes.button} onClick={this.onCancel}>
                        <FormattedMessage id="cancel" />
                    </Button>
                    {
                      !isOwner && <CircularProgress style={{position:"absolute"}}/>
                    }
                  </React.Fragment>
                }
              </div>
            </form>
          </Grid>
        </Grid>
      </React.Fragment>
    );
  }
}

NewGroup.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(NewGroup);
