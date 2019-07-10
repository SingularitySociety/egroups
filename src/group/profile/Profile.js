import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import EditableField from '../../common/EditableField';
import useDocument from '../../common/useDocument';

const styles = theme => ({
  button: {
      margin: theme.spacing(1)
  }
});

function Profile(props) {
  const { db, group, user, callbacks, match:{params:{userId}}  } = props;
  const setTabbar = callbacks.setTabbar;
  const [member] = useDocument(db, `groups/${group.groupId}/members/${userId}`);

  useEffect(()=>{
    setTabbar("profile", `pr/${userId}`);
  }, [setTabbar, userId]);

  const onSave = name => async value => {
      // no-op
  }    
    
  if (!user) {
      return <Redirect to={`/${group.groupName}`} />
  }
  if (!member) {
      return "";
  }
  return <div>
    <FormGroup row>
      <EditableField label={<FormattedMessage id="member.displayName"/>} 
          value={member.displayName} onSave={onSave('displayName')} disabled={true}/>
    </FormGroup>
    <FormGroup row>
      <EditableField label={<FormattedMessage id="member.description"/>} multiline={true}
          value={member.description} onSave={onSave('description')} disabled={true}/>
    </FormGroup>
    <FormGroup row>
      <EditableField label={<FormattedMessage id="member.email"/>} 
          value={member.email || ""} onSave={onSave('email')} disabled={true}/>
    </FormGroup>
    <FormGroup row>
      <EditableField label={<FormattedMessage id="member.twitter"/>} 
          value={member.twitter || ""} onSave={onSave('twitter')} disabled={true}/>
    </FormGroup>
    <FormGroup row>
      <EditableField label={<FormattedMessage id="member.github"/>} 
          value={member.github || ""} onSave={onSave('github')} disabled={true}/>
    </FormGroup>
  </div>
}

Profile.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Profile);