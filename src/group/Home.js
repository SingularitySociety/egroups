import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  welcome: {
    marginTop: theme.spacing(9),
  }
});

class Home extends React.Component {
  render() {
      const { group, classes } = this.props;
      return (
        <Typography component="h2" variant="h5" gutterBottom className={classes.welcome}>
          Welcome to {group.title}
        </Typography>
      )
  }
}

Home.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Home);