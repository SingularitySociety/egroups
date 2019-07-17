import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';


const styles = theme => ({
  message: {
    marginBottom: theme.spacing(1),
  }
});

function Invited(props) {
  const { classes, callbacks } = props;
  const setTabbar = callbacks.setTabbar;

  function handleJoin() {

  }

  useEffect(()=>{
    setTabbar("invited");
  }, [setTabbar]);

  return <div>
    <Typography className={classes.message}>
      <FormattedMessage id="you.are.invited" />
    </Typography>
    <Button variant="contained" color="primary" onClick={handleJoin} className={classes.button}>
      <FormattedMessage id="join" />
    </Button>
    </div>;
}

Invited.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Invited);