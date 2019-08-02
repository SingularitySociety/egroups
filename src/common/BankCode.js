import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Select, InputLabel, TextField, FormControl } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import zenginCode from 'zengin-code';

const allKeys = Object.keys(zenginCode);

const styles = theme => ({
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(2),
  },
});

function BankCode(props) {
  const { classes } = props;
  const [bankFilter, setBankFilter] = useState("");
  const [branchFilter, setBranchFilter] = useState("");
  const [bankCode, setBankCode] = useState("0001");
  const [keys, setKeys] = useState(allKeys);
  const [branchKeys, setBranchKeys] = useState([]);
  const [branchCode, setBranchCode] = useState("");
  const branches = zenginCode[bankCode].branches;

  function onBankCodeChange(e) {
    setBankCode(e.target.value);
  }
  function onBranchCodeChange(e) {
    setBranchCode(e.target.value);
  }
  function onBankFilterChange(e) {
    setBankFilter(e.target.value);
  }
  function onBranchFilterChange(e) {
    setBranchFilter(e.target.value);
  }

  useEffect(()=>{
    if (bankFilter === "") {
      setKeys(allKeys);
    }
    const regex = new RegExp(bankFilter);
    setKeys(allKeys.filter((key)=>{
      return regex.test(zenginCode[key].name);
    }));

  }, [bankFilter]);

  useEffect(()=>{
    setBranchCode("");
    setBranchFilter("");
  }, [bankCode]);

  useEffect(()=>{
    const allBranchKeys = Object.keys(branches);
    if (branchFilter === "") {
      setBranchKeys(allBranchKeys);
    }
    const regex = new RegExp(branchFilter);
    setBranchKeys(allBranchKeys.filter((key)=>{
      return regex.test(branches[key].name + key);
    }));

  }, [branchFilter, branches]);

  console.log(branches);

  return (
    <div>
      <FormControl className={classes.formControl}>
        <TextField label={<FormattedMessage id="bank.name.filter" />} 
                    value={bankFilter} onChange={onBankFilterChange} />
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="bank.name" /></InputLabel>
        <Select native 
                value={bankCode} 
                onChange={onBankCodeChange} >
          {
            keys.map(key=>{
              const bankInfo = zenginCode[key];
              return <option key={key} value={key}>{bankInfo.name}</option>;
            })
          }
        </Select>
      </FormControl>
      <FormControl className={classes.formControl}>
        <TextField label={<FormattedMessage id="branch.name.filter" />} 
                    value={branchFilter} onChange={onBranchFilterChange} />
      </FormControl>
      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="branch.name" /></InputLabel>
        <Select native 
                value={branchCode} 
                onChange={onBranchCodeChange} >
          <option key="not selected" value=""></option>
          {
            branchKeys.map((key)=>{
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
};
  
export default withStyles(styles)(BankCode);
