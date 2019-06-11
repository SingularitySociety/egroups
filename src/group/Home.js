import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import ChannelList from './ChannelList';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(0),
  }
});

class Home extends React.Component {
  render() {
      const { user, db, member, group, history } = this.props;
      const context = { user, group, db, member, history };
      return (
        <div>
          <Typography component="h2" variant="h6" gutterBottom>
            <FormattedMessage id="channels" />
          </Typography>
          <ChannelList {...context}/>
        </div>
      )
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Home);