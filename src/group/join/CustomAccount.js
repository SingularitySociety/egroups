import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, Paper, Tabs, Tab } from '@material-ui/core';
import ResultMessage from '../../common/ResultMessage';
import Processing from '../../common/Processing';
import useOnDocument from '../../common/useOnDocument';
import { FormattedMessage } from 'react-intl';
import * as firebase from "firebase/app";
import "firebase/functions";
import AccountCompanyJP from './AccountCompanyJP';
import AccountCompanyPersonJP, {extract_personal_dataJP} from './AccountCompanyPersonJP';
import AccountIndividualJP from './AccountIndividualJP';

const styles = theme => ({
  paper: {
    marginBottom: theme.spacing(2),
  }
});

function smartCopy(obj) {
  const keys = Object.keys(obj);
  return keys.reduce((values, key)=>{
    const value = obj[key];
    if (key === 'dob' && typeof value === 'object' && value["day"] === null) {
      return values;
    }
    if (value !== null && value !== "" && typeof value !== 'boolean') {
      values[key] = value;
    }
    return values;
  }, {})
}

function CustomAccount(props) {
  const { db, group, callbacks, classes } = props;
  const groupId = group.groupId;
  const setTabbar = callbacks.setTabbar;
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [account] = useOnDocument(db, `groups/${groupId}/private/account`);
  const [account_data, setAccountData] = useState({});
  const [personal_data, setPersonalData] = useState({});
  const [requirements, setRequirements] = useState({});
  const [business_type, setBusinessType] = useState(null);
  const [tabValue, setTabValue] = useState(0);

  //console.log(account);
  //console.log(account_data);

  useEffect(()=>{
    setTabbar("settings.bank");
  }, [setTabbar]);

  useEffect(()=> {
    if (account && account.account) {
      console.log(account.account);
      setBusinessType(account.account.business_type);
      if (account.account.business_type === "company") {
        console.log("company");
        setAccountData(account.account.company || {});
        const country = account.account.country;
        const person = account.person;
        if (country === "JP") {
          console.log("###### JP", person);
          setPersonalData(extract_personal_dataJP(person));
        }
      } else if (account.account.business_type === "individual") {
        console.log("individual");
        setAccountData(account.account.individual || {});
      }

      if (account.account.requirements) {
        const array = account.account.requirements.eventually_due;
        const reqs = array.reduce((values, key)=>{
          values[key] = true;
          return values;
        }, {});
        console.log(reqs);
        setRequirements(reqs);
      }
    }
  }, [account]);

  function setAccountValue(key, subkey, value) {
    const new_data = smartCopy(account_data);
    if (subkey) {
      const obj = account_data[key] || {};
      obj[subkey] = value;
      new_data[key] = obj;
      console.log(obj);
    } else {
      new_data[key] = value;
    }
    setAccountData(new_data);
  }

  function setPersonValue(key, subkey, value) {
    const new_data = smartCopy(personal_data);
    if (subkey) {
      const obj = personal_data[key] || {};
      obj[subkey] = value;
      new_data[key] = obj;
      //console.log(obj);
    } else {
      new_data[key] = value;
    }
    console.log(new_data);
    setPersonalData(new_data);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setProcessing(true);
    const account_copy = smartCopy(account_data);
    //console.log(account_data, account_copy);

    const context = { groupId, business_type, account_data:account_copy };
    if (business_type === "company" && Object.keys(personal_data).length>0) {
      context.personal_data = personal_data;
      if (context.personal_data.gender === "please.specify") {
        delete context.personal_data.gender;
      }
    }
    console.log(context);
    const updateCustomAccount = firebase.functions().httpsCallable('updateCustomAccount');
    const result = (await updateCustomAccount(context)).data;
    console.log(result);
    if (!result.result) {
      //console.log("error", result.error.message);
      setError(result.error.message);
    }
    setProcessing(false);
  }
  function handleTabChange(e, newValue) {
    setTabValue(newValue);
  }
 
  return <form>
    {
      (business_type === "company") ?
      <div>
        <Paper square className={classes.paper}>
        <Tabs value={tabValue} indicatorColor="primary" onChange={handleTabChange}>
          <Tab label={<FormattedMessage id="tab.company"/>} />
          <Tab label={<FormattedMessage id="tab.person"/>} />
          <Tab label={<FormattedMessage id="tab.bank"/>} />
        </Tabs>
        </Paper>
        {
          (tabValue === 0) &&       
           <AccountCompanyJP account_data={account_data} requirements={requirements} setAccountValue={setAccountValue} />
        }
        {
           (tabValue === 1) &&       
           <AccountCompanyPersonJP personal_data={personal_data} requirements={requirements} setPersonValue={setPersonValue} />
        }
      </div>
      :
      <div>
        <Paper square className={classes.paper}>
        <Tabs value={tabValue} indicatorColor="primary" onChange={handleTabChange}>
          <Tab label={<FormattedMessage id="tab.individual"/>} />
          <Tab label={<FormattedMessage id="tab.bank" />} />
        </Tabs>
        </Paper>
        {
         (tabValue === 0) &&       
           <AccountIndividualJP account_data={account_data} requirements={requirements} setAccountValue={setAccountValue} />
        }
      </div>
    }
    <div>
      <Button variant="contained" type="submit" onClick={handleSubmit}>
        <FormattedMessage id="submit" />
      </Button>
      <Processing active={processing} />
    </div>  
    <ResultMessage error={error} />
  </form>
}

CustomAccount.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(CustomAccount);