import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import PleaseLogin from './PleaseLogin';

const styles = theme => ({
  about: {
    color: "red",
  },
});
const useStyles = makeStyles(styles);

function Subscribe(props) {
  const classes = useStyles();
  const { selectTab, user } = props;

  useEffect(()=>{
    selectTab("subscribe");
  }, [selectTab]);

  if (!user) {
    return <PleaseLogin />
  }

  return (
      <Typography className={classes.about}>Subscribe</Typography>
  )
}

Subscribe.propTypes = {
  group: PropTypes.object.isRequired,
};
  
export default Subscribe;