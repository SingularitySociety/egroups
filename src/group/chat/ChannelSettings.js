import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormGroup, Button, Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { Redirect } from 'react-router-dom';
import EditableField from '../../common/EditableField';
import LockedArea from '../../common/LockedArea';
import useOnDocument from '../../common/useOnDocument';

const styles = theme => ({
});

function ChannelSettings(props) {
  const { db, group, match:{params:{channelId}}, callbacks } = props;
  const path = `groups/${group.groupId}/channels/${channelId}`;
  const [entity] = useOnDocument(db, path);
  const setTabbar = callbacks.setTabbar;

  useEffect(()=>{
    setTabbar("channel.settings", `ch/${channelId}`);
  }, [setTabbar, channelId]);

  const onSave = name => async value => {
    await db.doc(path).set({[name]:value}, {merge:true});
  }
  const onDelete = async () => {
    await db.doc(path).delete();
  }

  if (!entity) {
    if (entity === null) {
      return <Redirect to={`/g/${group.groupName}/channels`} />
    }
    return "";
  }

  return (
    <div>
      <FormGroup row>
        <EditableField label={<FormattedMessage id="channel.title"/>} value={entity.title} onSave={onSave('title')}/>
      </FormGroup>
      <LockedArea label={<FormattedMessage id="warning.dangerous" />}>
        <Button variant="contained" onClick={onDelete}>
          <DeleteIcon color="error" />
          <Typography color="error"><FormattedMessage id="destroy.channel" /></Typography>
        </Button>
      </LockedArea>
    </div>
  )
}

ChannelSettings.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(ChannelSettings);