import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Channels from './Channels';
import { Typography } from '@material-ui/core';

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
            Channels
          </Typography>
          <Channels {...context}/>
        </div>
      )
  }
}

Home.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Home);