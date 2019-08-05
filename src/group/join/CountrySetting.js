import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CountryOptions from '../../options/CountryOptions';
import BusinessTypeOptions from '../../options/BusinessTypeOptions';
import { FormControl, InputLabel, Select, Button, FormGroup, TextField } from '@material-ui/core';
import { FormattedMessage, injectIntl } from 'react-intl';
import * as firebase from "firebase/app";
import "firebase/functions";
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(1),
  },
  button: {
    marginBottom: theme.spacing(2),
    marginRight: theme.spacing(1),
  },
  textField: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(1),
  },
  textColor: {
    color: "#333333",
  }
});

function CountrySetting(props) {
  const { classes, group, account } = props;
  const { messages } = props.intl;
  const groupId = group.groupId;

  const [country, setCountry] = useState((account && account.account && account.account.country) || "JP");
  const [business_type, setBusinessType] = useState((account && account.account && account.account.business_type) || "company");
  const [processing, setProcessing] = useState(false);

  function handleCountryChange(e) {
    console.log(e.currentTarget.value);
    setCountry(e.currentTarget.value);
  }
  function handleBusinessTypeChange(e) {
    console.log(e.currentTarget.value);
    setBusinessType(e.currentTarget.value);
  }
  async function onSubmit(e) {
    const payload = { country, groupId, business_type };
    const createCustomAccount = firebase.functions().httpsCallable('createCustomAccount');
    setProcessing(true);
    const result = (await createCustomAccount(payload)).data;
    // If it's succeeded, this component will be unmounted immediately.
    if (!result.result) {
      setProcessing(false);
    }
    console.log(result);
  }
  if (account) {
    try {
      //const { account:{country} } = account;
      return (<div>
        <FormGroup row>
          <TextField label={<FormattedMessage id="billing.country"/>} 
            value={messages[country]} disabled={true} className={classes.textField}
            InputProps={{classes:{input:classes.textColor}}}/>
        </FormGroup>
        <br/>
        <FormGroup row>
          <TextField label={<FormattedMessage id="business.type"/>} 
            value={messages[business_type]} disabled={true} className={classes.textField}
            InputProps={{classes:{input:classes.textColor}}}/>
        </FormGroup>
      </div>)
    } catch(e) {
      return "error"; // BUGBUG
    }
  }

  return <div>
    <FormControl className={classes.formControl}>
      <InputLabel><FormattedMessage id="billing.country" /></InputLabel>
      <Select native value={country}　onChange={handleCountryChange}>
        <CountryOptions />
      </Select>
    </FormControl>
    <br/>
    <FormControl className={classes.formControl}>
      <InputLabel><FormattedMessage id="business.type" /></InputLabel>
      <Select native value={business_type}　onChange={handleBusinessTypeChange}>
        <BusinessTypeOptions />
      </Select>
    </FormControl>
    <br/>
    <Button variant="contained" color="primary" onClick={onSubmit} className={ classes.button }>
      <FormattedMessage id="submit" />
    </Button>
    {
      processing && <CircularProgress size={24}/>
    }
  </div>;
}

CountrySetting.propTypes = {
  classes: PropTypes.object.isRequired,
  group: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(injectIntl(CountrySetting));
  