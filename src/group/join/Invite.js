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
  const { callbacks, classes, db, group, user } = props;
  const setTabbar = callbacks.setTabbar;
  const [level, setLevel] = useState(Privileges.member);

  useEffect(()=>{
    setTabbar("invite");
  }, [setTabbar]);

  function handleLevel(e) {
    setLevel(parseInt(e.target.value));
  }

  async function handleInvite(e) {
    const key = uuidv4();
    const doc = await db.collection(`groups/${group.groupId}/invites`).add({
      key,
      count:1,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      duration: 60*60*1000, // one hour
      privilege: level,
      invitedBy: user.uid,
      accepted:{},
    });
    const path = `${window.location.href}/${doc.id}/${key}`;
    console.log(path);
  }

  return <React.Fragment>
    <FormControl className={classes.formControl}>
      <InputLabel><FormattedMessage id="invitation.privilege" /></InputLabel>
      <Select　native　value={level}　onChange={handleLevel}>
        <PrivilegeOptions noSubscriber={true} />
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