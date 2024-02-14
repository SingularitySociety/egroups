import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import Processing from '../../common/Processing';
import * as firebase from "firebase/app";
import "firebase/functions";
import PleaseLogin from './PleaseLogin';
import ResultMessage from '../../common/ResultMessage';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
  message: {
    marginBottom: theme.spacing(1),
  }
});

function Invited(props) {
  const { classes, callbacks, group, user, privilege, match:{params:{inviteId, inviteKey}} } = props;
  const groupId = group.groupId;
  const setTabbar = callbacks.setTabbar;
  const [validated, setValidated] = useState(null);
  const [processing, setProcessing] = useState(false);

  console.log(groupId, inviteId, inviteKey);

  useEffect(()=>{
    setTabbar("invited");
  }, [setTabbar]);

  useEffect(()=>{
    let mounted = true;
    async function validate() {
      const payload = { groupId, inviteId, inviteKey, validating:true };
      const processInvite = firebase.functions().httpsCallable('processInvite');
      const result = (await processInvite(payload)).data;
      console.log(result);
      if (mounted) {
        setValidated(result);
      }
    }
    validate();
    return () => {
      mounted = false;
    }
  }, [groupId, inviteId, inviteKey])

  async function handleJoin() {
    setProcessing(true);
    const payload = { groupId, inviteId, inviteKey, 
      displayName:user.displayName, email:user.email };
    const processInvite = firebase.functions().httpsCallable('processInvite');
    const result = (await processInvite(payload)).data;
    if (result.result) {
      callbacks.memberDidUpdate();
    } else {
      setProcessing(false);
    }
    console.log(result);
  }

  if (validated === null) {
    return <Processing active={true} />
  }

  if (validated.result === false) {
    return <ResultMessage error={<FormattedMessage id="error.invalid.invite"/>} />
  }

  if (!user) {
    return <PleaseLogin />;
  }

  if (privilege) {
    console.log("Become a member or already a member. Redireting to the group home.");
    return <Redirect to={`/g/${group.groupName}`} />
  }

  return <div>
    <Typography className={classes.message}>
      <FormattedMessage id="you.are.invited" />
    </Typography>
    <Button variant="contained" color="primary" onClick={handleJoin} className={classes.button}>
      <FormattedMessage id="join" />
    </Button>
    <Processing active={processing} />
    </div>;
}

Invited.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Invited);