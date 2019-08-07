import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { TextField, FormControl, InputLabel, Select } from '@material-ui/core';
import CountryPhoneOptions from '../../options/CountryPhoneOptions';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  country: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '12rem',
  },
  number: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '12rem',
  },
});

const regex = /^[0-9\-()]*/  

function PhoneNumber(props) {
  const { classes, setPhoneNumber } = props;
  const [countryCode, setCountryCode] = useState("+81");
  const [number, setNumber] = useState("");

  function onUpdate(co, num) {
    let newValue = co + num;    
    if (co === "+81" && num[0] === "0") {
      newValue = co + num.slice(1);    
    } else if (co === "+1" && num[0] === "1") {
      newValue = co + num.slice(1);    
    }
    console.log(newValue);
    setPhoneNumber(newValue);
  }

  function onCountryCodeChange(e) {
    const newValue = e.target.value;
    setCountryCode(newValue);
    onUpdate(newValue, number);
  }

  function onNumberChange(e) {
    const newValue = e.target.value.match(regex)[0];
    setNumber(newValue);
    onUpdate(countryCode, newValue)
  }

  return (<div>
      <FormControl className={classes.country}>
        <InputLabel><FormattedMessage id="gender" /></InputLabel>
        <Select native value={countryCode} onChange={onCountryCodeChange}>
          <CountryPhoneOptions />
        </Select>
      </FormControl>
      <FormControl className={classes.number}>
        <TextField value={number} onChange={onNumberChange}
          label={<FormattedMessage id={"individual.phone"} />}/>
      </FormControl>
    </div>);
}

PhoneNumber.propTypes = {
  classes: PropTypes.object.isRequired,
  setPhoneNumber: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(PhoneNumber);
