import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';


const styles = theme => ({
  about: {
    color: "red",
  },
});

function About(props) {
  const { classes } = props;
  return (
    <Typography className={classes.about}>"about"</Typography>
  )
}

About.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(About);