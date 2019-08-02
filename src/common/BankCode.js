import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Select, InputLabel, TextField } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import zenginCode from 'zengin-code';

const allKeys = Object.keys(zenginCode);

const styles = theme => ({
});

function BankCode(props) {
  const [filter, setFilter] = useState("");
  const [bankCode, setBankCode] = useState("");
  const [keys, setKeys] = useState(allKeys);

  function onBankCodeChange(e) {
    setBankCode(e.target.value);
  }
  function onFilterChange(e) {
    setFilter(e.target.value);
  }

  useEffect(()=>{
    if (filter === "") {
      setKeys(allKeys);
    }
    const regex = new RegExp(filter);
    setKeys(allKeys.filter((key)=>{
      return regex.test(zenginCode[key].name);
    }));

  }, [filter]);

  return (
    <div>
    <TextField value={filter} onChange={onFilterChange} />
    <InputLabel><FormattedMessage id="gender" /></InputLabel>
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
    </div>
  );
}

BankCode.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(BankCode);
