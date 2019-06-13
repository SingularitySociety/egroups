import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  errorMessage: {
    color: "#ff8000",
  }
});

class AccessDenied extends React.Component {
  render() {
    const {classes} = this.props;
    return (
      <Typography component="h2" variant="h5" gutterBottom　className={ classes.errorMessage} >
        <FormattedMessage id="warning.access.denied" />
      </Typography>
    )
  }
}

AccessDenied.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(AccessDenied);