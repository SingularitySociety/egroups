import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { FormControl, InputLabel, Select, Button, TextField } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import * as firebase from "firebase/app";
import "firebase/firestore";
import Privileges from '../../const/Privileges';
import PrivilegeOptions from '../../options/PrivilegeOptions';
import Processing from '../../common/Processing';
import ResultMessage from '../../common/ResultMessage';
import AccessDenied from '../../common/AccessDenied';
import validator from 'validator';

const styles = theme => ({
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(1),
  },
});

function uuidv4() {
  return 'xxxxxxxx_xxxx_4xxx_yxxx_xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c === 'x' ? r : ((r & 0x3) | 0x8);
    return v.toString(16);
  });
}

function Invite(props) {
  const { callbacks, classes, db, group, user, member } = props;
  const { privilege, requirePemission, accessControll } = props;
  const setTabbar = callbacks.setTabbar;
  const [level, setLevel] = useState(Privileges.member);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [email, setEmail] = useState("");
  const [validated, setValidated] = useState(false);

  useEffect(()=>{
    setTabbar("invite");
  }, [setTabbar]);

  if (!accessControll(requirePemission, privilege)) {
    return <AccessDenied />;
  }
  
  function handleLevel(e) {
    setLevel(parseInt(e.target.value));
  }

  async function handleInvite(e) {
    e.preventDefault();
    const key = uuidv4();
    setProcessing(true);
    try {
      const doc = await db.collection(`groups/${group.groupId}/invites`).add({
        key,
        count:1,
        created: firebase.firestore.FieldValue.serverTimestamp(),
        duration: 60*60*1000 * 24 * 2, // one hour * 24 * 2 = 2 days
        privilege: level,
        invitedBy: user.uid,
        accepted:{},
      });
      const path = `${window.location.href}/${doc.id}/${key}`;
      console.log(path);

      const language = navigator.language.split(/[-_]/)[0];  // language without region code
      const payload = { template:"invite", locale:language, 
                        email: email,
                        values: {
                          path, 
                          groupName:group.title, 
                          invitedBy: member.displayName } };
      const sendMail = firebase.functions().httpsCallable('sendMail');
      const result = (await sendMail(payload)).data;
      console.log("sendMail:", result);
      if (result.result) {
        setMessage(<FormattedMessage id="success.mail.sent" />);
        setEmail("");
      } else {
        setError(<FormattedMessage id="error.failed" values={{error:result.message}}/>); 
      }
    } catch(e) {
      console.log(e);
      setError(<FormattedMessage id="error.failed" values={{error:e}}/>); 
    }
    setProcessing(false);
  }

  function handleEmailChange(e) {
    setMessage(null);
    setEmail(e.currentTarget.value);
    setValidated(validator.isEmail(e.currentTarget.value));
  }

  return <form>
    <FormControl className={classes.formControl}>
      <InputLabel><FormattedMessage id="invitation.privilege" /></InputLabel>
      <Select　native　value={level}　onChange={handleLevel}>
        <PrivilegeOptions noSubscriber={true} />
      </Select>
    </FormControl>
    <br/>
    <FormControl className={classes.formControl}>
      <TextField
          label={<FormattedMessage id="invite.email.address" />}
          className={classes.textField}
          value={email}
          onChange={handleEmailChange}
          margin="normal"
        />
    </FormControl>
    <br/>
    <Button variant="contained" onClick={handleInvite} disabled={!validated} type="submit">
      <FormattedMessage id="invite" />
    </Button>
    <Processing active={processing} />
    <ResultMessage error={error} message={message} />
  </form>;
}

Invite.propTypes = {
    classes: PropTypes.object.isRequired,
  };
  
export default withStyles(styles)(Invite);
