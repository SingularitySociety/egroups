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
  const { classes } = props;
  const [countryCode, setCountryCode] = useState("+81");
  const [number, setNumber] = useState("");

  useEffect(() => {
    let newValue = countryCode + number;    
    if (countryCode === "+81" && number[0] === "0") {
      newValue = countryCode + number.slice(1);    
    }
    console.log(newValue);
  }, [countryCode, number]);

  function onCountryCodeChange(e) {
    console.log(e.target.value);
    setCountryCode(e.target.value.match(regex)[0]);
  }

  function onNumberChange(e) {
    setNumber(e.target.value);
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
};
  
export default withStyles(styles)(PhoneNumber);
