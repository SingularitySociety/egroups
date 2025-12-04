import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Select, InputLabel, TextField, FormControl } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import useDocument from './useDocument';

const styles = theme => ({
  formControl: {
    width:theme.spacing(30),
    marginBottom: theme.spacing(1),
    marginRight: theme.spacing(1),
  },
});

function BankCode(props) {
  const { db, classes, setRoutingNumber, routingNumber, valid } = props;
  const [zengin] = useDocument(db, 'static/zengin');
  const [allKeys, setAllKeys] = useState([]);
  const [bankFilter, setBankFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [bankCode, setBankCode] = useState("0001");
  const [keys, setKeys] = useState(allKeys);
  const [branchKeys, setBranchKeys] = useState([]);
  const [branchCode, setBranchCode] = useState("");
  const [branches] = useDocument(db, zengin && bankCode && `static/zengin/branches/${bankCode}`);
  
  useEffect(()=>{
    const banks = (zengin && zengin.banks) || {};
    setAllKeys(Object.keys(banks));
  }, [zengin]);

  function onBankCodeChange(e) {
    setBankCode(e.target.value);
  }
  function onBranchCodeChange(e) {
    const newValue = e.target.value;
    setBranchCode(newValue);
    if (newValue !== "") {
      setRoutingNumber(bankCode + newValue);
    }
  }
  function onBankFilterChange(e) {
    setBankFilter(e.target.value);
  }
  function onBranchFilterChange(e) {
    setBranchFilter(e.target.value);
  }

  useEffect(()=>{
    if (routingNumber && routingNumber.length===7) {
      setBankCode(routingNumber.slice(0,4));
      setBranchCode(routingNumber.slice(4,7));      
    }
  }, [routingNumber]);

  useEffect(()=>{
    if (!zengin) {
      setKeys([]);
    }
    if (bankFilter === "") {
      setKeys(allKeys);
    }
    const regex = new RegExp(bankFilter);
    setKeys(allKeys.filter((key)=>{
      return regex.test(zengin.banks[key].name);
    }));

  }, [bankFilter, allKeys, zengin]);

  useEffect(()=>{
    setBranchCode("");
    setBranchFilter("");
  }, [bankCode]);

  useEffect(()=>{
    const allBranchKeys = Object.keys(branches || {});
    if (branchFilter === "") {
      setBranchKeys(allBranchKeys);
    }
    const regex = new RegExp(branchFilter);
    setBranchKeys(allBranchKeys.filter((key)=>{
      return regex.test(branches[key].name + key);
    }));

  }, [branchFilter, branches]);

  return (
    <div>
      <FormControl className={classes.formControl}>
        <TextField label={<FormattedMessage id="bank.name.filter" />} 
                    value={bankFilter} onChange={onBankFilterChange} />
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="bank.name" /></InputLabel>
        <Select native
                error={!valid}
                value={bankCode} 
                onChange={onBankCodeChange} >
          {
            keys.map(key=>{
              const bankInfo = zengin.banks[key];
              return <option key={key} value={key}>{bankInfo.name}</option>;
            })
          }
        </Select>
      </FormControl>
      <br/>
      <FormControl className={classes.formControl}>
        <TextField label={<FormattedMessage id="branch.name.filter" />} 
                    value={branchFilter} onChange={onBranchFilterChange} />
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="branch.name" /></InputLabel>
        <Select native
                error={!valid}
                value={branchCode} 
                onChange={onBranchCodeChange} >
          <option key="not selected" value=""></option>
          {
            branches && branchKeys.map((key)=>{
              if (!branches[key]) {
                return false;　// mismaatch (because of timing)
              }
              return <option key={key} value={key}>
                  {branches[key].name} ({key})
                </option>;
            })
          }
        </Select>
      </FormControl>
    </div>
  );
}

BankCode.propTypes = {
  classes: PropTypes.object.isRequired,
  db: PropTypes.object.isRequired,
  setRoutingNumber: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(BankCode);
