import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
});

function Invite(props) {
  const { callbacks } = props;
  const setTabbar = callbacks.setTabbar;

  useEffect(()=>{
    setTabbar("invite");
  }, [setTabbar]);

  return "Invite"
}

Invite.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Invite);