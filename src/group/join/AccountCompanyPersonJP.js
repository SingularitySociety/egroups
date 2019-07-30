import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { TextField, FormControl, InputLabel, Select } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import GenderOptions from '../../options/GenderOptions';

const styles = theme => ({
  field: {
    marginBottom: theme.spacing(1),
  },
  form: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '24rem',
  },
  year: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '10rem',
  },
  month: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '5rem',
  },
  day: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '5rem',
  },
});

const person_keys = ["last_name_kana", "last_name_kanji", "first_name_kana", "first_name_kanji", "phone"];
const dob_keys = ["year", "month", "day"];
const address_keys = ["postal_code", "state", "city", "town", "line1", "line2"];
const person_keys_all = ["last_name_kana", "last_name_kanji", "first_name_kana", "first_name_kanji", "phone", "dob", "gender", "address_kanji", "address_kana"];

export function extract_personal_dataJP(person) {
  return person_keys_all.reduce((values, key) => {
    const value = person[key];
    if (value) {
      values[key] = value;
    }
    return values;
  }, {});
}

function AccountCompanyPersonJP(props) {
  const { classes, personal_data, setPersonValue, requirements } = props;
  console.log(requirements);

  return (<React.Fragment>
    {
      person_keys.map((key)=>{
        return <FormControl key={key} className={classes.form}>
        <TextField error={requirements[key]} label={<FormattedMessage id={"individual."+key} />} 
              value={personal_data[key] || ""} 
              onChange={(e)=>setPersonValue(key, null, e.target.value)} />
      </FormControl>
      })      
    }
    {
      address_keys.map((subkey)=>{
        const ckey="address_kana."+subkey;
        return <FormControl key={ckey} className={classes.form}>
        <TextField error={requirements[ckey]} label={<FormattedMessage id={"individual."+ckey} />} 
              value={(personal_data["address_kana"]||{})[subkey] || ""} 
              onChange={(e)=>setPersonValue("address_kana", subkey, e.target.value)} />
      </FormControl>
      })      
    }
    {
      address_keys.map((subkey)=>{
        const ckey="address_kanji."+subkey;
        return <FormControl key={ckey} className={classes.form}>
        <TextField error={requirements[ckey]} label={<FormattedMessage id={"individual."+ckey} />} 
              value={(personal_data["address_kanji"]||{})[subkey] || ""} 
              onChange={(e)=>setPersonValue("address_kanji", subkey, e.target.value)} />
      </FormControl>
      })      
    }
    <br/>
    {
      dob_keys.map((key)=>{
        return <FormControl key={key} className={classes[key]}>
        <TextField label={<FormattedMessage id={"individual.dob."+key} />} 
              value={(personal_data.dob && personal_data.dob[key]) || ""} 
              onChange={(e)=>setPersonValue("dob", key, parseInt(e.target.value))} />
      </FormControl>
      })      
    }
    <FormControl className={classes.form}>
      <InputLabel><FormattedMessage id="gender" /></InputLabel>
      <Select native value={personal_data["gender"] || "please.specify"} onChange={(e)=>setPersonValue("gender", null, e.target.value)} >
        <GenderOptions />
      </Select>
    </FormControl>
  </React.Fragment>)
}

AccountCompanyPersonJP.propTypes = {
  classes: PropTypes.object.isRequired,
  personal_data: PropTypes.object.isRequired,
  requirements: PropTypes.object.isRequired,
  setPersonValue: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountCompanyPersonJP);