import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import EditableField from '../../common/EditableField';
import ImageUploader from '../../common/ImageUploader';
import LeaveAccount from './LeaveAccount';
import * as firebase from "firebase/app";
import "firebase/firestore";

const styles = theme => ({
});

function Account(props) {
  const { db, user, group, callbacks } = props;
  const { member, privilege } = props;
  const setTabbar = callbacks.setTabbar;

  useEffect(()=>{
    setTabbar("account");
  }, [setTabbar]);

  const onSave = name => async value => {
    //console.log(name, value);
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    await refMember.set({[name]:value}, {merge:true});
    callbacks.memberDidUpdate();
  };

  const onImageUpload = async (imageUrl) => {
    console.log("onImageUpload", imageUrl);
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    await refMember.set({hasImage:true, profile:{thumbnails:firebase.firestore.FieldValue.delete()}}, {merge:true});
    callbacks.memberDidUpdate();
  };
    
  if (!user) {
    return <Redirect to={`/g/${group.groupName}`} />;
  }
  if (!member) {
    return "";
  }
  const context = { db, user, group, callbacks, privilege, member } ;
  //console.log(user, member);
  const imageThumbnails = member.profile && member.profile.thumbnails;
  return <div>
    <FormGroup row>
      <ImageUploader imagePath={`/groups/${group.groupId}/members/${user.uid}/images/profile`} 
          imageThumbnails={imageThumbnails}
          onImageUpload={onImageUpload} loadImage={member.hasImage}/>
    </FormGroup>
    <FormGroup row>
      <EditableField label={<FormattedMessage id="member.displayName"/>} 
          value={member.displayName} onSave={onSave('displayName')}/>
    </FormGroup>
    <FormGroup row>
      <EditableField label={<FormattedMessage id="member.description"/>} multiline={true}
          value={member.description} onSave={onSave('description')}/>
    </FormGroup>
    <FormGroup row>
      <EditableField label={<FormattedMessage id="member.email"/>} 
          value={member.email || ""} onSave={onSave('email')}/>
    </FormGroup>
    <FormGroup row>
      <EditableField label={<FormattedMessage id="member.twitter"/>} 
          value={member.twitter || ""} onSave={onSave('twitter')}/>
    </FormGroup>
    <FormGroup row>
      <EditableField label={<FormattedMessage id="member.github"/>} 
          value={member.github || ""} onSave={onSave('github')}/>
    </FormGroup>
    <LeaveAccount {...context} />
  </div>;
}

Account.propTypes = {
  classes: PropTypes.object.isRequired,
  callbacks: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Account);
