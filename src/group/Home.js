import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
});

class Home extends React.Component {
  render() {
      const { group } = this.props;
      return (
        <Typography component="h2" variant="h5" gutterBottom>
          Welcome to {group.title}
        </Typography>
      )
  }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Home);