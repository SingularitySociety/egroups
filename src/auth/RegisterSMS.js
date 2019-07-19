import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button, TextField, InputLabel, Select } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import Processing from '../common/Processing';
import * as firebase from "firebase/app";
import "firebase/functions";
import CountryPhoneOptions from '../options/CountryPhoneOptions';
import ErrorInline from '../common/ErrorInline';

const styles = theme => ({
  row: {
    marginBottom: theme.spacing(1),
  }
});

const regex = /^[0-9\-()]*/    

function RegisterSMS(props) {
  const { classes, phone } = props;
  const [processing, setProcessing] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [digit6, setDigit6] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [country, setCountry] = useState("+81");
  const [error, setError] = useState(null);
  
  async function onSubmit(e) {
    console.log("onSubmit");
    e.preventDefault();
    setProcessing(true);
    setError(false);    
    const payload = { phone:country + phoneNumber };
    const requestOnetimeSMS = firebase.functions().httpsCallable('requestOnetimeSMS');
    const result = (await requestOnetimeSMS(payload)).data;
    setConfirming(result.result);
    console.log(result);
    setProcessing(false);
    if (!result.result) {
      setError(<FormattedMessage id="invalid.phone.number" />);
    }
  }
  function onChangeDigit6(e) {
    const value = parseInt(e.currentTarget.value) || "";
    setDigit6((""+value).substring(0,6));
  }
  function onChangePhoneNumber(e) {
    setError(false);
    setPhoneNumber(e.currentTarget.value.match(regex)[0]);
  }
  function onCountryChange(e) {
    setCountry(e.currentTarget.value);
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
    return <div>
      <div className={classes.row}>
        <TextField label={label} value={digit6} onChange={onChangeDigit6}/>
      </div>
      <div className={classes.row}>
        <Button variant="contained" onClick={onConfirm} disabled={ digit6.length<6 }>
          <FormattedMessage id="submit" />
        </Button>
        <Processing active={processing} />
      </div>
    </div>
  }
  if (phone) {
    return <div className={classes.row}>
      <Typography >
        { phone }
      </Typography>
    </div>
  }

  const label=<FormattedMessage id="phone.number" />
  return <form>
    <div className={classes.row} />
      <InputLabel><FormattedMessage id="phone.country" /></InputLabel>
      <Select native value={country}　onChange={onCountryChange}>
        <CountryPhoneOptions />
      </Select>
    <div/>
    <div className={classes.row} />
      <TextField label={label} value={phoneNumber} onChange={onChangePhoneNumber}/>
    <div/>
    <div className={classes.row} />
      <Button variant="contained" onClick={onSubmit} type="submit">
        <FormattedMessage id="submit" />
      </Button>
      <Processing active={processing} />
      <ErrorInline message={error} />
    <div/>
  </form>
}

RegisterSMS.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(RegisterSMS);
