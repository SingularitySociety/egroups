import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';

const styles = theme => ({
});

class Listing extends React.Component {
  componentDidMount() {
    const { selectTab } = this.props;
    selectTab("listing");
  }
  render() {
      return (
          <Typography component="h2" variant="h5" gutterBottom>
            "Under Construction"
          </Typography>
        )
  }
}

Listing.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Listing);