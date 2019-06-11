import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
});

class NewGroup extends React.Component {
    render() {
      console.log("new Gruop");
        return (
            <Typography component="h2" variant="h5" gutterBottom>
              "New Group"
            </Typography>
          )
    }
}

NewGroup.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(NewGroup);