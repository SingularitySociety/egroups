import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup, TextField } from '@material-ui/core';
import { Redirect } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';
import useDocument from '../../common/useDocument';
import AccessDenied from '../../common/AccessDenied';
import ImageUploader from '../../common/ImageUploader';

const styles = theme => ({
  textField: {
    width: "90%",
    marginBottom: theme.spacing(1),
    margin: "auto",
  },
  textColor: {
    color: "#333333",
  },
  image: {
    marginLeft: "auto",
    marginRight: "auto",
    marginBottom: "10px",
  },
});

function Profile(props) {
  const { db, group, user, callbacks, match:{params:{userId}}, classes  } = props;
  const setTabbar = callbacks.setTabbar;
  const [member, err] = useDocument(db, `groups/${group.groupId}/members/${userId}`);

  useEffect(()=>{
    setTabbar("profile", `pr/${userId}`);
  }, [setTabbar, userId]);

  if (!user) {
    return <Redirect to={`/g/${group.groupName}`} />;
  }
  if (err) {
    return <AccessDenied />;
  }
  if (!member) {
      return "";
  }
  const imagePath = `groups/${group.groupId}/members/${member.userId}/images/profile`; 
  const thumbnails = member.profile && member.profile.thumbnails;

  return <div>
           <ImageUploader imagePath={imagePath} loadImage={member.hasImage} imageThumbnails={thumbnails}
                          readOnly={true} displayMode={"thumbMiddleCenter"} inline={true} />
    <FormGroup row>
      <TextField label={<FormattedMessage id="member.displayName"/>} variant="outlined"
          value={member.displayName} disabled={true} className={classes.textField}
          InputProps={{classes:{input:classes.textColor}}}/>
    </FormGroup>
    <FormGroup row>
      <TextField label={<FormattedMessage id="member.description"/>} variant="outlined"
          value={member.description} disabled={true} className={classes.textField}
          multiline={true} rows={2} rowsMax={6} 
          InputProps={{classes:{input:classes.textColor}}}/>
    </FormGroup>
    <FormGroup row>
      <TextField label={<FormattedMessage id="member.email"/>} variant="outlined"
          value={member.email || ""} disabled={true} className={classes.textField}
          InputProps={{classes:{input:classes.textColor}}}/>
    </FormGroup>
    <FormGroup row>
      <TextField label={<FormattedMessage id="member.twitter"/>} variant="outlined"
          value={member.twitter || ""} disabled={true} className={classes.textField}
          InputProps={{classes:{input:classes.textColor}}}/>
    </FormGroup>
    <FormGroup row>
      <TextField label={<FormattedMessage id="member.github"/>} variant="outlined"
          value={member.github || ""} disabled={true} className={classes.textField}
          InputProps={{classes:{input:classes.textColor}}}/>
    </FormGroup>
  </div>;
}

Profile.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Profile);
