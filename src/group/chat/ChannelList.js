import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ChannelItem from './ChannelItem';
import AccessDenied from '../../common/AccessDenied';

const styles = theme => ({
});

function ChannelList(props) {
  const { db, group, limit, history } = props;
  const [list, setList] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    let query = db.collection(`groups/${group.groupId}/channels`).orderBy("created", "desc");
    if (limit) {
      query = query.limit(limit);
    }
    const detacher = query.onSnapshot((snapshot) => {
      const list = [];
      snapshot.forEach((doc)=>{
        const channel = doc.data();
        channel.channelId = doc.id;
        list.push(channel);
      });
      setList(list);
    }, (e) => {
      setError(e);
    })
    return detacher;
  }, [db, group, limit]);

  if (error) {
    return <AccessDenied error={error} />
  }
  return <div>
    {
      list.map((channel)=>{
        return <ChannelItem key={channel.channelId} channel={channel} group={group} history={history} />
      })
    }
  </div>
}

ChannelList.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(ChannelList);