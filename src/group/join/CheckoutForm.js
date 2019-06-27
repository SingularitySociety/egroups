import React from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';


const styles = theme => ({
  about: {
    color: "red",
  },
});
const useStyles = makeStyles(styles);

function About(props) {
  const classes = useStyles();
  return (
      <Typography className={classes.about}>"checkoutform"</Typography>
  )
}

About.propTypes = {
  ///classes: PropTypes.object.isRequired,
};
  
export default About;