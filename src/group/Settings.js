import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup } from '@material-ui/core';
import { FormControl, InputLabel, Select, Button, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormattedMessage } from 'react-intl';
import PrivilegeOptions from '../options/PrivilegeOptions';
import Privileges from '../const/Privileges';
import EditableField from '../common/EditableField';
import ImageUploader from '../common/ImageUploader';
import ColorOptions from '../options/ColorOptions';
import LockedArea from '../common/LockedArea';
import { Redirect, Link } from 'react-router-dom';
import * as firebase from "firebase/app";
import "firebase/firestore";

const styles = theme => ({
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(2),
  },
  billing: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  button: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
  }
});

function Settings(props) {
  const { group, db, callbacks, classes, privilege } = props;
  const setTabbar = callbacks.setTabbar;
  const [redirect, setRedirect] = useState(null);

  useEffect(()=>{
    setTabbar("settings");
  }, [setTabbar])

  /*
  const handleCheck = name => async event => {
    const refGroup = db.doc(`groups/${group.groupId}`);
    await refGroup.set({privileges:{membership:{[name]:event.target.checked}}}, {merge:true});
    callbacks.groupDidUpdate();
  };
  */    

  const handleChange = name => async event => {
    const refGroup = db.doc(`groups/${group.groupId}`);
    switch(name) {
    case "channelCreate":
      // BUGBUG: Why  do we need to use parseInt?
      await refGroup.set({privileges:{channel:{create:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "articleCreate":
      await refGroup.set({privileges:{article:{create:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "pageCreate":
        await refGroup.set({privileges:{page:{create:parseInt(event.target.value)}}}, {merge:true});
        break;
    case "eventCreate":
      await refGroup.set({privileges:{event:{create:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "memberRead":
      await refGroup.set({privileges:{member:{read:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "themePrimary":
        await refGroup.set({theme:{primary:event.target.value}}, {merge:true});
        break;
    default:
      console.log("no handler", name, event.target.value);
      break;
    }
    callbacks.groupDidUpdate();
  };

  const onSave = name => async value => {
    //console.log(name, value);
    const refGroup = db.doc(`groups/${group.groupId}`);
    await refGroup.set({[name]:value}, {merge:true});
    callbacks.groupDidUpdate();
  }
  const onImageUpload = async (imageUrl) => {
    console.log("onImageUpload", imageUrl);
    const refGroup = db.doc(`groups/${group.groupId}`);
    await refGroup.set({hasImage:true, profile:{thumbnails:firebase.firestore.FieldValue.delete()}}, {merge:true});
    callbacks.groupDidUpdate();
  }
  const onDelete = async () => {
    console.log("onDelete");
    const refGroup = db.doc(`groups/${group.groupId}`);
    await refGroup.delete();
    setRedirect("/");
  }

  if (redirect) {
    return <Redirect to={redirect} />
  }

  const subscription = group.subscription || false;
  const channelCreate = group.privileges.channel.create || Privileges.member;
  const articleCreate = group.privileges.article.create || Privileges.member;
  const pageCreate = group.privileges.page.create || Privileges.admin;
  const eventCreate = group.privileges.event.create || Privileges.member;
  const memberRead = (group.privileges.member && group.privileges.member.read) || Privileges.member;
  const imageThumbnails = group.profile && group.profile.thumbnails;
  const themePrimary = (group.theme && group.theme.primary) || "blue";
  return (
    <div>
      <FormGroup row>
        <ImageUploader imagePath={`/groups/${group.groupId}/images/profile`}
            imageThumbnails={imageThumbnails}
            onImageUpload={onImageUpload} loadImage={group.hasImage}/>
      </FormGroup>

      <FormGroup row>
        <EditableField label={<FormattedMessage id="group.title"/>} value={group.title} onSave={onSave('title')}/>
      </FormGroup>
      <FormGroup row>
        <EditableField label={<FormattedMessage id="group.description" />} value={group.description || ""} 
          multiline={true} onSave={onSave('description')}/>
      </FormGroup>

      <FormGroup row className={classes.billing}>
        { subscription &&
          <div>
            <Button className={classes.button} variant="contained" color="primary" component={Link} to={`/g/${group.groupName}/settings/billing`}>
              <FormattedMessage id="settings.billing" />
            </Button>
            <Button className={classes.button} variant="contained" component={Link} to={`/g/${group.groupName}/payment/log`}>
              <FormattedMessage id="payment.log" />
            </Button>
            <Button className={classes.button} variant="contained" component={Link} to={`/g/${group.groupName}/payment/payout`}>
              <FormattedMessage id="payout.log" />
            </Button>
          </div>
        }
      </FormGroup>

      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="settings.theme.primary" /></InputLabel>
        <Select native value={themePrimary}　onChange={handleChange('themePrimary')}>
          <ColorOptions />
        </Select>
      </FormControl>
      <br/>
      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="settings.member.read" /></InputLabel>
        <Select　native　value={memberRead}　onChange={handleChange('memberRead')}>
          <PrivilegeOptions />
        </Select>
      </FormControl>
      <br/>
      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="settings.channel.create" /></InputLabel>
        <Select　native　value={channelCreate}　onChange={handleChange('channelCreate')}>
          <PrivilegeOptions />
        </Select>
      </FormControl>
      <br/>
      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="settings.article.create" /></InputLabel>
        <Select　native　value={articleCreate}　onChange={handleChange('articleCreate')}>
          <PrivilegeOptions />
        </Select>
      </FormControl>
      <br/>
      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="settings.page.create" /></InputLabel>
        <Select　native　value={pageCreate}　onChange={handleChange('pageCreate')}>
          <PrivilegeOptions />
        </Select>
      </FormControl>
      <br/>
      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="settings.event.create" /></InputLabel>
        <Select　native　value={eventCreate}　onChange={handleChange('eventCreate')}>
          <PrivilegeOptions />
        </Select>
      </FormControl>
      {
        privilege >= Privileges.owner && 
        <LockedArea label={<FormattedMessage id="warning.dangerous" />}>
        <Button variant="contained" onClick={onDelete}>
          <DeleteIcon color="error" />
          <Typography color="error"><FormattedMessage id="destroy.group" /></Typography>
        </Button>
        </LockedArea>
      }
    </div>
  )
}

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
    callbacks: PropTypes.object.isRequired,
    group: PropTypes.object.isRequired,
    db: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Settings);
