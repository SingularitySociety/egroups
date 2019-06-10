import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
  userName: {
    color: "#606060",
  }
});

class Message extends React.Component {
  render() {
    const { message, classes } = this.props;
    return (
      <div>
        <Typography variant="caption" className={classes.userName} gutterBottom>
          { message.userName }
        </Typography>
        <Typography gutterBottom>
          { message.message }
        </Typography>
      </div>
    )
  }
}

Message.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Message);