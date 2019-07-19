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
  },
  button: {
    marginRight: theme.spacing(1),
  }
});

const regex = /^[0-9\-()]*/    

function RegisterSMS(props) {
  const { classes, phone, marioToken, setMarioToken } = props;
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
  async function onConfirm(e) {
    console.log("onConfirm");
    e.preventDefault();
    setProcessing(true);
    setError(false);
    const payload = { token:digit6 };
    const confirmOnetimeSMS = firebase.functions().httpsCallable('confirmOnetimeSMS');
    const result = (await confirmOnetimeSMS(payload)).data;
    console.log(result);
    setProcessing(false);
    if (result.result) {
      setMarioToken(result.token);
    } else {
      setError(<FormattedMessage id="invalid.digit6" />);
    }
  }

  if (confirming) {
    const label=<FormattedMessage id="sms.type.digit6" />
    return <form>
      <div className={classes.row}>
        <Typography>
          <FormattedMessage id="please.enter.code" />
        </Typography>
      </div>
      <div className={classes.row}>
        <TextField label={label} value={digit6} onChange={onChangeDigit6}/>
      </div>
      <div className={classes.row}>
        <Button variant="contained" onClick={onConfirm} disabled={ digit6.length<6 } 
                type="submit" color="primary" className={classes.button}>
          <FormattedMessage id="submit" />
        </Button>
        <Button variant="contained" onClick={()=>{setConfirming(false)}} className={classes.button}>
          <FormattedMessage id="retry" />
        </Button>
        <Processing active={processing} />
        <ErrorInline message={error} />
      </div>
    </form>
  }
  if (phone) {
    return <div className={classes.row}>
      <div className={classes.row}>
        <Typography >
          <FormattedMessage id="registered.phone" values={{ phone }} />
        </Typography>
      </div>
      {
        !marioToken &&
        <React.Fragment>
          <div className={classes.row}>
            <Typography>
              <FormattedMessage id="please.send.code" />
            </Typography>
          </div>
            <div className={classes.row} >
            <Button variant="contained" onClick={onSubmit} type="submit" color="primary">
              <FormattedMessage id="send.code" />
            </Button>
            <Processing active={processing} />
            <ErrorInline message={error} />
          </div>
        </React.Fragment>
      }
    </div>
  }

  const label=<FormattedMessage id="phone.number" />
  return <form>
    <div className={classes.row}>
      <Typography>
        <FormattedMessage id="please.enter.phone" />
      </Typography>
    </div>
    <div className={classes.row} >
      <InputLabel><FormattedMessage id="phone.country" /></InputLabel>
      <Select native value={country}　onChange={onCountryChange}>
        <CountryPhoneOptions />
      </Select>
      </div>
    <div className={classes.row} >
      <TextField label={label} value={phoneNumber} onChange={onChangePhoneNumber}/>
      </div>
    <div className={classes.row} >
      <Button variant="contained" onClick={onSubmit} type="submit" color="primary">
        <FormattedMessage id="send.code" />
      </Button>
      <Processing active={processing} />
      <ErrorInline message={error} />
      </div>
  </form>
}

RegisterSMS.propTypes = {
  classes: PropTypes.object.isRequired,
  setMarioToken: PropTypes.func.isRequired,
};

export default withStyles(styles)(RegisterSMS);
