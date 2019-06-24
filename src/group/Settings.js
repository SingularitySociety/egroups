import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormGroup, Switch, FormControlLabel } from '@material-ui/core';
import { FormControl, InputLabel, Select, Button, Typography } from '@material-ui/core';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormattedMessage } from 'react-intl';
import PrivilegeOptions from './PrivilegeOptions';
import Privileges from '../const/Privileges';
import EditableField from '../common/EditableField';
import ImageUploader from '../common/ImageUploader';
import ColorOptions from './ColorOptions';
import LockedArea from '../common/LockedArea';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(2),
  }
});

class Settings extends React.Component {
  constructor(props) {
    super(props);
    const { group, db } = props;
    this.refGroup = db.doc(`groups/${group.groupId}`);
    this.state = {};
  }
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("settings");
    console.log(this.props.group);
  }
  handleCheck = name => async event => {
    await this.refGroup.set({privileges:{membership:{[name]:event.target.checked}}}, {merge:true});
    this.props.reloadGroup();
  };    
  handleChange = name => async event => {
    switch(name) {
    case "channelCreate":
      // BUGBUG: Why  do we need to use parseInt?
      await this.refGroup.set({privileges:{channel:{create:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "articleCreate":
      await this.refGroup.set({privileges:{article:{create:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "eventCreate":
      await this.refGroup.set({privileges:{event:{create:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "memberRead":
      await this.refGroup.set({privileges:{member:{read:parseInt(event.target.value)}}}, {merge:true});
      break;
    case "themePrimary":
        await this.refGroup.set({theme:{primary:event.target.value}}, {merge:true});
        break;
    default:
      console.log("no handler", name, event.target.value);
      break;
    }
    this.props.reloadGroup();
  };
  onSave = name => async value => {
    //console.log(name, value);
    await this.refGroup.set({[name]:value}, {merge:true});
    this.props.reloadGroup();
  }
  onImageUpload = async (imageUrl) => {
    console.log("onImageUpload", imageUrl);
    await this.refGroup.set({hasImage:true}, {merge:true});
    this.props.reloadGroup();
  }
  onDelete = async () => {
    console.log("onDelete");
    await this.refGroup.delete();
    this.setState({redirect:"/"});
  }
  render() {
    const { redirect } = this.state;
    if (redirect) {
      return <Redirect to={redirect} />
    }
    const { classes, group } = this.props;
    const open = group.privileges.membership.open || false;
    const channelCreate = group.privileges.channel.create || Privileges.member;
    const articleCreate = group.privileges.article.create || Privileges.member;
    const eventCreate = group.privileges.event.create || Privileges.member;
    const memberRead = (group.privileges.member && group.privileges.member.read) || Privileges.member;
    const imageThumbnails = group.profile && group.profile.thumbnails;
    const themePrimary = (group.theme && group.theme.primary) || "blue";
    return (
      <div>
        <FormGroup row>
          <ImageUploader imagePath={`/groups/${group.groupId}/images/profile`}
              imageThumbnails={imageThumbnails}
              onImageUpload={this.onImageUpload} loadImage={group.hasImage}/>
        </FormGroup>

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

        <FormControl className={classes.formControl}>
          <InputLabel><FormattedMessage id="settings.theme.primary" /></InputLabel>
          <Select　native　value={themePrimary}　onChange={this.handleChange('themePrimary')}>
            <ColorOptions />
          </Select>
        </FormControl>
        <br/>
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
        {
          true && 
          <LockedArea label={<FormattedMessage id="warning.dangerous" />}>
          <Button variant="contained" onClick={this.onDelete}>
            <DeleteIcon color="error" />
            <Typography color="error"><FormattedMessage id="destroy.group" /></Typography>
          </Button>
          </LockedArea>
        }
      </div>
    )
  }
}

Settings.propTypes = {
    classes: PropTypes.object.isRequired,
    reloadGroup: PropTypes.func.isRequired,
    group: PropTypes.object.isRequired,
    db: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Settings);