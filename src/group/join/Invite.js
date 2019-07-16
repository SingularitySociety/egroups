import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormControl, InputLabel, Select, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import PrivilegeOptions from '../PrivilegeOptions';

const styles = theme => ({
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(2),
  },
});

function Invite(props) {
  const { callbacks, classes } = props;
  const setTabbar = callbacks.setTabbar;
  const [level, setLevel] = useState(0);

  useEffect(()=>{
    setTabbar("invite");
  }, [setTabbar]);

  function handleLevel(e) {
    setLevel(e.target.value);
  }

  function handleInvite(e) {
    console.log("invite");
  }

  return <React.Fragment>
    <FormControl className={classes.formControl}>
      <InputLabel><FormattedMessage id="invitation.privilege" /></InputLabel>
      <Select　native　value={level}　onChange={handleLevel}>
        <PrivilegeOptions />
      </Select>
    </FormControl>
    <br/>
    <Button variant="contained" onClick={handleInvite}>
      <FormattedMessage id="invite" />
    </Button>
  </React.Fragment>
}

Invite.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Invite);