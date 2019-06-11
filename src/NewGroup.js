import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Grid, Button, TextField } from '@material-ui/core';
import Header from './Header';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import Privileges from './group/Privileges';

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
    width: 200,
  },
});

class NewGroup extends React.Component {
  state = { title:"", path:"", invalid:true, conflict:false };

  async componentDidMount() {
    console.log(window.location);
    const { db, match:{params:{groupId}} } = this.props;
    const doc = (await db.doc(`groups/${groupId}`).get()).data();
    this.setState({title:doc.title});
  }

  onSubmit = async (e) => {
    e.preventDefault();
    console.log("onSubmit");
    const { db, match:{params:{groupId}} } = this.props;
    const { path, title } = this.state;
    const refName = db.doc(`groupNames/${path}`);
    const refGroup = db.doc(`groups/${groupId}`);
    db.runTransaction(async (tr)=>{
      const doc = await tr.get(refName);
      if (doc.exits) {
        throw new Error("This path is already taken");
      }
      tr.set(refName, { groupId:groupId });
      tr.set(refGroup, { 
        groupName:path, 
        title,
        privileges: {
          channel: { read:Privileges.member, write:Privileges.member, create:Privileges.member },
          article: { read:Privileges.member, write:Privileges.member, comment:Privileges.member },
          event: { read:Privileges.member, write:Privileges.member, attend:Privileges.member },
          membership: { open:false },
        }
       }, {merge:true});
    }).then(() => {
      // BUGBUG: For some reason, redirect does not work (infinit spiral)
      //  this.setState({redirect:`/${path}`});
      window.location.pathname = `/${path}`;
    }).catch((e) => {
      // Handle Error
      console.log(e);
    });
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

  render() {
    const { classes, user } = this.props;
    const { redirect, title, path, invalid, conflict } = this.state;
    if (redirect) {
      return <Redirect to={ redirect } />
    }
    return (
      <React.Fragment>
        <Header user={user} />
        <Grid container justify="center" alignItems="center" direction="row" className={classes.root}>
          <Grid item style={{width:"calc(80vmin)"}}>
            <Typography component="h2" variant="h6" gutterBottom>
              <FormattedMessage id="new.group" />
            </Typography>
            <form className={classes.form}>
              <TextField label={<FormattedMessage id="group.name" />} value={title} 
                  onChange={this.handleChange('title')} className={classes.textField} margin="normal" />
              <br/>
              <TextField label={<FormattedMessage id={conflict ? "path.conflict" : "group.path"} />} value={path} autoFocus={true} error={ invalid }
                  onChange={this.handleChange('path')} className={classes.textField} margin="normal" />
              <br/>
              <div>Group URL: {`https:/${window.location.host}/${path || "..."}`}</div>
              <div>
                <Button variant="contained" color="primary" className={classes.button} disabled={ invalid }
                  onClick={this.onSubmit} type="submit"><FormattedMessage id="create" /></Button>
                <Button variant="contained" className={classes.button} onClick={this.onCancel}>
                    <FormattedMessage id="cancel" />
                </Button>
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