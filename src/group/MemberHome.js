import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ArticleList from './blog/ArticleList';
import ChannelList from './ChannelList';
import { Grid } from '@material-ui/core';

const styles = theme => ({
});

class MemberHome extends React.Component {
    componentDidMount() {
      const { selectTab } = this.props;
      selectTab("member");
    }
    render() {
      const { user, db, member, group, history, arps } = this.props;
      const context = { user, group, db, member, history };
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
}

MemberHome.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(MemberHome);