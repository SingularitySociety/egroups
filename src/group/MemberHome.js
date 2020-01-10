import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import ArticleList from './blog/ArticleList';
import ChannelList from './chat/ChannelList';
import { Grid } from '@material-ui/core';

function MemberHome(props) {
  const { user, db, member, group, history, arps, callbacks, privilege } = props;
  const setTabbar = callbacks.setTabbar;

  useEffect(()=> {
    setTabbar("member");
  }, [setTabbar]);

  const context = { user, group, db, member, history, privilege };
  return (
    <Grid container justify="center" spacing={1}>
      <Grid item xs={12}>
        <ChannelList {...context} limit={3} />
      </Grid>
      <Grid item xs={12}>
        <ArticleList {...context} arp={arps.blog} limit={3} />
      </Grid>
      <Grid item xs={12}>
        <ArticleList {...context} arp={arps.pages} limit={3} />
      </Grid>
    </Grid>
  )
}

MemberHome.propTypes = {
  callbacks: PropTypes.object.isRequired,
};
  
export default MemberHome;
