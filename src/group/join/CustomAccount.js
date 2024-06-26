import React, { useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, Paper, Tabs, Tab, Typography } from '@material-ui/core';
import ResultMessage from '../../common/ResultMessage';
import Processing from '../../common/Processing';
import useOnDocument from '../../common/useOnDocument';
import { FormattedMessage } from 'react-intl';
import * as firebase from "firebase/app";
import "firebase/functions";
import AccountCompanyJP, {company_data_required} from './AccountCompanyJP';
import AccountCompanyPersonJP, {extract_personal_dataJP, person_data_required} from './AccountCompanyPersonJP';
//import AccountIndividualJP from './AccountIndividualJP';
import AccountBankJP, {extract_bank_data, bank_data_required} from './AccountBankJP';
import AccountAccept, {accept_data_required} from './AccountAccept';
import AccessDenied from '../../common/AccessDenied';

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

function arrayToFlags(array) {
  return array.reduce((values, key)=>{
    values[key] = true;
    return values;
  }, {});
}

function CustomAccount(props) {
  const { db, group, callbacks, classes } = props;
  const { requirePemission, accessControll, privilege } = props;
  const groupId = group.groupId;
  const setTabbar = callbacks.setTabbar;
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [account] = useOnDocument(db, `groups/${groupId}/private/account`);
  const [account_data, setAccountData] = useState({});
  const [personal_data, setPersonalData] = useState({});
  const [bank_data, setBankData] = useState(null);
  const [requirements, setRequirements] = useState({});
  const [requirementsP, setRequirementsP] = useState({});
  const [business_type, setBusinessType] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  const [page, setPage] = useState(null);
  const [acceptance, setAcceptance] = useState(false);
  const [tabColors, setTabColors] = useState({});
  const resultRef = useRef(null);

  //console.log(account);
  //console.log(account_data);

  useEffect(()=>{
    setTabbar("settings.bank");
  }, [setTabbar]);

  /*
  useEffect(()=>{
    console.log("page:", page);
  }, [page]);
  */

  useEffect(()=>{
    //console.log("----", error);
    if (error) {
      resultRef.current.scrollIntoView();
    }
  }, [error]);

  useEffect(()=> {
    if (account && account.account) {
      console.log(account);
      const country = account.account.country;
      setBusinessType(account.account.business_type);
      if (account.account.business_type === "company") {
        //console.log("company");
        setAccountData(account.account.company || {});
        const person = account.person;
        if (person) {
          //console.log("###### JP", person);
          if (person.requirements) {
            setRequirementsP(arrayToFlags(person.requirements.eventually_due));
          }
          if (country === "JP") {
            setPersonalData(extract_personal_dataJP(person));
          }
        }
      } else if (account.account.business_type === "individual") {
        //console.log("individual");
        setAccountData(account.account.individual || {});
      }
      const external_accounts = account.account.external_accounts;
      if (external_accounts && external_accounts.data && external_accounts.data.length > 0) {
        const data = external_accounts.data[0];
        setBankData(extract_bank_data(data));
      }

      if (account.account.requirements) {
        const reqs = arrayToFlags(account.account.requirements.eventually_due);
        console.log(reqs);
        setRequirements(reqs);
      }
    }
  }, [account]);

  useEffect(()=>{
    const colors = {};
    colors.bank = bank_data_required(requirements) ? "error" : "inherit";
    colors.accept = accept_data_required(requirements) ? "error" : "inherit";
    if (business_type === "company") {
      colors.company = company_data_required(requirements) ? "error" : "inherit";
      colors.opener = "inherit";
      if (requirements["relationship.account_opener"]) {
        colors.opener = "error";
      } else if (requirementsP) {
        colors.opener = person_data_required("", requirementsP) ? "error" : "inherit";
      }
    } else if (business_type === "individual") {
      colors.individual = person_data_required("individual.", requirements) ? "error" : "inherit";
    }
    setTabColors(colors);
  }, [requirements, requirementsP, business_type]);

  function setAccountValue(key, subkey, value) {
    const new_data = smartCopy(account_data);
    if (subkey) {
      const obj = account_data[key] || {};
      obj[subkey] = value;
      new_data[key] = obj;
      console.log(obj);
    } else if (key === "gender" && value === "please.specify") {
      console.log("please_specify was selected");
      delete new_data.gender;
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
    } else if (key === "gender" && value === "please.specify") {
      console.log("please_specify was selected");
      delete new_data.gender;
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
    // BUGBUG: Remove "verification" to work-around "unknown parameters: details, details_code" error.    
    // This is a new behavior, and I am not sure what.
    delete account_copy.verification;

    const context = { groupId, business_type, account_data:account_copy };
    if (page==="bank" && bank_data) {
      context.external_account = bank_data;
    }
    if (acceptance) {
      context.acceptance = true;
    }
    if (business_type === "company" && Object.keys(personal_data).length>0) {
      context.personal_data = personal_data;
      /*
      if (context.personal_data.gender === "please.specify") {
        delete context.personal_data.gender;
      }
      */
      context.personal_data.relationship = {account_opener:true}; // HACK;
    }
    console.log(context);
    const updateCustomAccount = firebase.functions().httpsCallable('updateCustomAccount');
    const result = (await updateCustomAccount(context)).data;
    console.log(result);
    if (!result.result) {
      console.log("error", result);
      const message = result.error.message;
      if (typeof message === 'object') {
        setError(message.stripe_message || message.message);
      }
    }
    setProcessing(false);
  }
  function handleTabChange(e, newValue) {
    setTabValue(newValue);
  }

  if (!accessControll(requirePemission, privilege)) {
    return <AccessDenied />;
  }
  
  return <form>
    {
      (business_type === "company") ?
      <div>
        <Paper square className={classes.paper}>
        <Tabs value={tabValue} indicatorColor="primary" onChange={handleTabChange}>
          <Tab label={<Typography color={tabColors.company}><FormattedMessage id="tab.company"/></Typography>} />
          <Tab label={<Typography color={tabColors.opener}><FormattedMessage id="tab.person"/></Typography>} />
          <Tab label={<Typography color={tabColors.bank}><FormattedMessage id="tab.bank"/></Typography>} />
          <Tab label={<Typography color={tabColors.accept}><FormattedMessage id="tab.accept"/></Typography>} />
        </Tabs>
        </Paper>
        {
          (tabValue === 0) &&       
           <AccountCompanyJP 
              account_data={account_data} 
              requirements={requirements} 
              setPage={setPage}
              setAccountValue={setAccountValue} />
        }
        {
           (tabValue === 1) &&       
           <AccountCompanyPersonJP 
              personal_data={personal_data}
              no_opener={requirements["relationship.account_opener"]}
              groupId={groupId}
              setPage={setPage}
              requirements={requirementsP}
              prefix={""}
              setPersonValue={setPersonValue} />
        }
        {
           (tabValue === 2) &&       
           <AccountBankJP bank_data={bank_data} 
              db={db}
              setPage={setPage}
              business_type={business_type}
              setBankData={setBankData} />
        }
        {
          (tabValue === 3) &&
          <AccountAccept 
            acceptance={acceptance}
            requirements={requirements} 
            setPage={setPage}
            setAcceptance={setAcceptance}/>
        }
      </div>
      :
      <div>
        <Paper square className={classes.paper}>
        <Tabs value={tabValue} indicatorColor="primary" onChange={handleTabChange}>
          <Tab label={<Typography color={tabColors.individual}><FormattedMessage id="tab.individual"/></Typography>} />
          <Tab label={<Typography color={tabColors.bank}><FormattedMessage id="tab.bank" /></Typography>} />
          <Tab label={<Typography color={tabColors.accept}><FormattedMessage id="tab.accept"/></Typography>} />
        </Tabs>
        </Paper>
        {
            (tabValue === 0) &&       
            <AccountCompanyPersonJP 
              personal_data={account_data}
              groupId={groupId}
              setPage={setPage}
              requirements={requirements}
              prefix={"individual."}
              setPersonValue={setAccountValue} />
        }
        {
           (tabValue === 1) &&       
           <AccountBankJP bank_data={bank_data} 
              db={db}
              setPage={setPage}
              business_type={business_type}
              setBankData={setBankData} />
        }
        {
          (tabValue === 2) &&
          <AccountAccept 
            acceptance={acceptance}
            requirements={requirements} 
            setPage={setPage}
            setAcceptance={setAcceptance}/>
        }      
       </div>
   }
    <div>
      <Button variant="contained" color="primary" type="submit" onClick={handleSubmit}>
        <FormattedMessage id="submit" />
      </Button>
      <Processing active={processing} />
    </div>
    <div ref={resultRef}>
      <ResultMessage error={error} />
    </div>  
  </form>
}

CustomAccount.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(CustomAccount);
