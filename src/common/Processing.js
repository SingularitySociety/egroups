import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  progress: {
    marginLeft: theme.spacing(1),
    position: "absolute",
  },
});

function Processing(props) {
  const { classes, active } = props;
  return (
    active && 
    <CircularProgress size={28} className={ classes.progress } />
  )
}

Processing.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Processing);