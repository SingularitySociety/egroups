import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, FormGroup } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import EditableField from '../../common/EditableField';
import ImageUploader from '../../common/ImageUploader';
import LockedArea from '../../common/LockedArea';
import Privileges from '../../const/Privileges';

const styles = theme => ({
  button: {
      margin: theme.spacing(1)
  }
});

class Account extends React.Component {
  componentDidMount() {
    const { callbacks } = this.props;
    callbacks.setTabbar("account");
}
handleLeave = async () => {
    const { db, user, group, callbacks } = this.props;
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    await refMember.delete();
    callbacks.memberDidUpdate();
    window.location.pathname = "/" + group.groupName;
}
onSave = name => async value => {
    //console.log(name, value);
    const { db, user, group, callbacks } = this.props;
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    await refMember.set({[name]:value}, {merge:true});
    callbacks.memberDidUpdate();
}    
onImageUpload = async (imageUrl) => {
    console.log("onImageUpload", imageUrl);
    const { db, user, group, callbacks } = this.props;
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    await refMember.set({hasImage:true}, {merge:true});
    callbacks.memberDidUpdate();
}
    
render() {
    const { classes, group, user, member, privilege } = this.props;
    if (!user) {
      return <Redirect to={`/${group.groupName}`} />
    }
    if (!member) {
      return "";
    }
    //console.log(user, member);
    const imageThumbnails = member.profile && member.profile.thumbnails;
    return <div>
      <FormGroup row>
        <ImageUploader imagePath={`/groups/${group.groupId}/members/${user.uid}/images/profile`} 
            imageThumbnails={imageThumbnails}
            onImageUpload={this.onImageUpload} loadImage={member.hasImage}/>
      </FormGroup>
      <FormGroup row>
        <EditableField label={<FormattedMessage id="member.displayName"/>} 
            value={member.displayName} onSave={this.onSave('displayName')}/>
      </FormGroup>
      <FormGroup row>
        <EditableField label={<FormattedMessage id="member.description"/>} multiline={true}
            value={member.description} onSave={this.onSave('description')}/>
      </FormGroup>
      <FormGroup row>
        <EditableField label={<FormattedMessage id="member.email"/>} 
            value={member.email || ""} onSave={this.onSave('email')}/>
      </FormGroup>
      <FormGroup row>
        <EditableField label={<FormattedMessage id="member.twitter"/>} 
            value={member.twitter || ""} onSave={this.onSave('twitter')}/>
      </FormGroup>
      <FormGroup row>
        <EditableField label={<FormattedMessage id="member.github"/>} 
            value={member.github || ""} onSave={this.onSave('github')}/>
      </FormGroup>
      {
        privilege < Privileges.owner &&    
        <LockedArea label={<FormattedMessage id="warning.dangerous" />}>
          <Button variant="contained" className={classes.button} onClick={this.handleLeave}>
            <FormattedMessage id="leave" />
          </Button>
        </LockedArea>
      }
    </div>
  }
}

Account.propTypes = {
  classes: PropTypes.object.isRequired,
  callbacks: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Account);