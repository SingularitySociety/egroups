import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { TextField, FormControl } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  field: {
    marginBottom: theme.spacing(1),
  },
  form: {
    marginRight: theme.spacing(1),
    marginBottom: theme.spacing(1),
    width: '20rem',
  },
});

function companyed(key) {
  return "individual."+key;
}

const address_keys = ["postal_code", "state", "city", "town", "line1", "line2"];

function AccountIndividualJP(props) {
  const { classes, account_data, requirements, setAccountValue } = props;
  console.log(requirements);
  return (<React.Fragment>
    {
      ["first_name_kana", "first_name_kanji", "last_name_kana", "last_name_kanji"].map((key)=>{
        const ckey = companyed(key);
        return <FormControl key={key} className={classes.form}>
        <TextField error={requirements[ckey]} label={<FormattedMessage id={ckey} />} 
              value={account_data[key] || ""} 
              onChange={(e)=>setAccountValue(key, null, e.target.value)} />
      </FormControl>
      })      
    }
    {
      address_keys.map((subkey)=>{
        const ckey="individual.address_kana."+subkey;
        return <FormControl key={ckey} className={classes.form}>
        <TextField error={requirements[ckey]} label={<FormattedMessage id={ckey} />} 
              value={(account_data["address_kana"]||{})[subkey] || ""} 
              onChange={(e)=>setAccountValue("address_kana", subkey, e.target.value)} />
      </FormControl>
      })      
    }
    {
      address_keys.map((subkey)=>{
        const ckey="individual.address_kanji."+subkey;
        return <FormControl key={ckey} className={classes.form}>
        <TextField error={requirements[ckey]} label={<FormattedMessage id={ckey} />} 
              value={(account_data["address_kanji"]||{})[subkey] || ""} 
              onChange={(e)=>setAccountValue("address_kanji", subkey, e.target.value)} />
      </FormControl>
      })      
    }
    <FormControl className={classes.form}>
      <TextField error={requirements["individual.phone"]} label={<FormattedMessage id="individual.phone" />} 
            value={account_data.phone || ""} 
            onChange={(e)=>setAccountValue("phone", null, e.target.value)} />
    </FormControl>
  </React.Fragment>)
}

AccountIndividualJP.propTypes = {
  classes: PropTypes.object.isRequired,
  account_data: PropTypes.object.isRequired,
  requirements: PropTypes.object.isRequired,
  setAccountValue: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountIndividualJP);