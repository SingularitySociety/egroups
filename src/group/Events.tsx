import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import Typography from '@material-ui/core/Typography';

const styles = theme => ({
});

function Events(props) {
  const { callbacks } = props;
  const setTabbar = callbacks.setTabbar;

  useEffect(() => {
    setTabbar("events");
  }, [setTabbar]);

  return (
    <Typography>
      "Under Construction"
    </Typography>
  );
}

Events.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(Events);
