import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
});

class About extends React.Component {
    render() {
        const { group } = this.props;
        return (
            <Typography component="h2" variant="h5" gutterBottom>
              { group.description }
            </Typography>
          )
    }
}

About.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(About);