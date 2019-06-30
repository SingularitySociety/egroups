import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormGroup, Button, Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import EditableField from '../../common/EditableField';
import LockedArea from '../../common/LockedArea';

const styles = theme => ({
});

class ChannelSettings extends React.Component {
  constructor(props) {
    super(props);
    const { db, group, match:{params:{channelId}} } = props;
    this.refEntity = db.doc(`groups/${group.groupId}/channels/${channelId}`);
    this.state = {entity:null};
  }
  async componentDidMount() {
    const { match:{params:{channelId}}, selectTab, group } = this.props;
    selectTab("channel.settings", `ch/${channelId}`);
    this.detacher = this.refEntity.onSnapshot((doc)=>{
      const entity = doc.data();
      if (entity) {
        this.setState({entity});
      } else {
        this.setState({redirect:`/${group.groupName}/channels`});
      }
    });
  }
  componentWillUnmount() {
    this.detacher();
  }
  onSave = name => async value => {
    await this.refEntity.set({[name]:value}, {merge:true});
  }
  onDelete = async () => {
    await this.refEntity.delete();
  }
  render() {
    const { entity, redirect } = this.state;
    if (redirect) {
      return <Redirect to={redirect} />
    }
    if (!entity) {
      return "";
    }
    return (
      <div>
        <FormGroup row>
          <EditableField label={<FormattedMessage id="channel.title"/>} value={entity.title} onSave={this.onSave('title')}/>
        </FormGroup>
        <LockedArea label={<FormattedMessage id="warning.dangerous" />}>
          <Button variant="contained" onClick={this.onDelete}>
            <DeleteIcon color="error" />
            <Typography color="error"><FormattedMessage id="destroy.channel" /></Typography>
          </Button>
        </LockedArea>
      </div>
    )
  }
}

ChannelSettings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(ChannelSettings);