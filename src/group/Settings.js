import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup, Switch, FormControlLabel } from '@material-ui/core';
import { FormControl, InputLabel, Select } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import PrivilegeOptions from './PrivilegeOptions';
import Privileges from '../const/Privileges';
import EditableField from '../common/EditableField';
import ImageUploader from '../common/ImageUploader';

const styles = theme => ({
  main: {
    marginLeft: theme.spacing(1),
  },
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(2),
  }
});

class Settings extends React.Component {
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("settings");
  }
  handleCheck = name => async event => {
    const { db, group } = this.props;
    const ref = db.doc(`groups/${group.groupId}`);
    await ref.set({privileges:{membership:{[name]:event.target.checked}}}, {merge:true});
    this.props.reloadGroup();
  };    
  handleChange = name => async event => {
    const { db, group } = this.props;
    const ref = db.doc(`groups/${group.groupId}`);
    switch(name) {
    case "channelCreate":
      // BUGBUG: Why  do we need to use parseInt?
      await ref.set({privileges:{channel:{create:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "articleCreate":
      await ref.set({privileges:{article:{create:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "eventCreate":
      await ref.set({privileges:{event:{create:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "memberRead":
      await ref.set({privileges:{member:{read:parseInt(event.target.value)}}}, {merge:true});
      break;
    default:
      console.log("no handler", name, event.target.value);
      break;
    }
    this.props.reloadGroup();
  };
  onSave = name => async value => {
    //console.log(name, value);
    const { db, group } = this.props;
    const ref = db.doc(`groups/${group.groupId}`);
    await ref.set({[name]:value}, {merge:true});
    this.props.reloadGroup();
  }
  onImageUpload = (imageUrl) => {
    console.log("onImageUpload", imageUrl);
  }
  render() {
    const { classes, group } = this.props;
    const open = group.privileges.membership.open || false;
    const channelCreate = group.privileges.channel.create || Privileges.member;
    const articleCreate = group.privileges.article.create || Privileges.member;
    const eventCreate = group.privileges.event.create || Privileges.member;
    const memberRead = group.privileges.member.read || Privileges.member;

    return (
      <div>
        <div className={classes.main}>
          <FormGroup row>
            <EditableField label={<FormattedMessage id="group.title"/>} value={group.title} onSave={this.onSave('title')}/>
          </FormGroup>
          <FormGroup row>
            <EditableField label={<FormattedMessage id="group.description" />} value={group.description || ""} 
              multiline={true} onSave={this.onSave('description')}/>
          </FormGroup>

          <FormGroup row>
            <FormControlLabel 
              control={ <Switch checked={open} onChange={this.handleCheck('open')} value="open" /> }
              label={<FormattedMessage id="settings.open" />}
            />
          </FormGroup>

          <FormGroup row>
            <ImageUploader imagePath={`/groups/${group.groupId}/profile`} onImageUpload={this.onImageUpload}/>
          </FormGroup>

          <FormControl className={classes.formControl}>
            <InputLabel><FormattedMessage id="settings.member.read" /></InputLabel>
            <Select　native　value={memberRead}　onChange={this.handleChange('memberRead')}>
              <PrivilegeOptions />
            </Select>
          </FormControl>
          <br/>
          <FormControl className={classes.formControl}>
            <InputLabel><FormattedMessage id="settings.channel.create" /></InputLabel>
            <Select　native　value={channelCreate}　onChange={this.handleChange('channelCreate')}>
              <PrivilegeOptions />
            </Select>
          </FormControl>
          <br/>
          <FormControl className={classes.formControl}>
            <InputLabel><FormattedMessage id="settings.article.create" /></InputLabel>
            <Select　native　value={articleCreate}　onChange={this.handleChange('articleCreate')}>
              <PrivilegeOptions />
            </Select>
          </FormControl>
          <br/>
          <FormControl className={classes.formControl}>
            <InputLabel><FormattedMessage id="settings.event.create" /></InputLabel>
            <Select　native　value={eventCreate}　onChange={this.handleChange('eventCreate')}>
              <PrivilegeOptions />
            </Select>
          </FormControl>
        </div>
      </div>
    )
  }
}

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
    reloadGroup: PropTypes.func.isRequired,
  };
  
export default withStyles(styles)(Settings);