import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormControl, InputLabel, Select, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import * as firebase from "firebase/app";
import "firebase/firestore";
import Privileges from '../../const/Privileges';
import PrivilegeOptions from '../../options/PrivilegeOptions';

const styles = theme => ({
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(2),
  },
});

function uuidv4() {
  return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

function Invite(props) {
  const { callbacks, classes, db, group } = props;
  const setTabbar = callbacks.setTabbar;
  const [level, setLevel] = useState(Privileges.member);

  useEffect(()=>{
    setTabbar("invite");
  }, [setTabbar]);

  function handleLevel(e) {
    setLevel(e.target.value);
  }

  async function handleInvite(e) {
    const key = uuidv4();
    console.log("invite", key);
    const doc = await db.collection(`groups/${group.groupId}/invites`).add({
      [key]:1,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      privilege: level,
    });
    console.log(doc.id);
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