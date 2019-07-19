import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button, TextField } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import Processing from '../common/Processing';
import * as firebase from "firebase/app";
import "firebase/functions";

const styles = theme => ({
  root: {
    marginTop: theme.spacing(1),
  },
});

function RegisterSMS(props) {
  const { classes, phone } = props;
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [digit6, setDigit6] = useState("");
  
  async function onSubmit() {
    console.log("onSubmit");
    setProcessing(true);
    const payload = { phone:"+1-4255334731" };
    const requestOnetimeSMS = firebase.functions().httpsCallable('requestOnetimeSMS');
    const result = (await requestOnetimeSMS(payload)).data;
    setConfirming(result.result);
    console.log(result);
    setProcessing(false);
  }
  function onChangeDigit6(e) {
    const value = parseInt(e.currentTarget.value) || "";
    setDigit6((""+value).substring(0,6));
  }
  async function onConfirm() {
    console.log("onConfirm");
    setProcessing(true);
    const payload = { token:digit6 };
    const confirmOnetimeSMS = firebase.functions().httpsCallable('confirmOnetimeSMS');
    const result = (await confirmOnetimeSMS(payload)).data;
    console.log(result);
    if (!result.result) {
      setProcessing(false);
    }
  }

  if (confirming) {
    const label=<FormattedMessage id="sms.type.digit6" />
    return <div className={classes.root}>
      <TextField label={label} value={digit6} onChange={onChangeDigit6}/>
      <Button variant="contained" onClick={onConfirm} disabled={ digit6.length<6 }>
        <FormattedMessage id="submit" />
      </Button>
      <Processing active={processing} />
    </div>
  }
  if (phone) {
    return <div className={classes.root}>
      <Typography >
        { phone }
      </Typography>
    </div>
  }
  return <div className={classes.root}>
    <Button variant="contained" onClick={onSubmit}>
      <FormattedMessage id="submit" />
    </Button>
    <Processing active={processing} />
  </div>
}

RegisterSMS.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RegisterSMS);
