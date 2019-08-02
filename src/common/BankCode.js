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
  const [branchKeys, setBranchKeys] = useState(allKeys);
  const [branchCode, setBranchCode] = useState("001");
  const [branches, setBranches] = useState({});

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
    setBranches(zenginCode[bankCode].branches);
  }, [bankCode]);

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
          {
            Object.keys(branches).map((key)=>{
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
