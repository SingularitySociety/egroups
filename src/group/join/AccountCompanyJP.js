import React, {useEffect} from 'react';
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
    width: '22rem',
  },
});

function companyed(key) {
  switch(key) {
    case "name_kana": return "company.business_name_kana";
    case "name_kanji": return "company.business_name_kanji"; 
    default: return "company."+key;
  }
}

const name_keys = ["name", "name_kana", "name_kanji", "tax_id"];
const address_keys = ["postal_code", "state", "city", "town", "line1", "line2"];

export function company_data_required(requirements) {
  let keys = ["company.phone"];
  keys = keys.concat(name_keys.map(key => "company."+key));
  keys = keys.concat(address_keys.map(key => "company.address_kanji."+key));
  keys = keys.concat(address_keys.map(key => "company.address_kana."+key));

  return keys.reduce((summary, key)=>{
    return summary || requirements[key];
  }, false);
}

function AccountCompanyJP(props) {
  const { classes, account_data, requirements, setAccountValue, setPage } = props;
  //console.log(requirements);
  useEffect(()=>{
    setPage("company");
  }, [setPage]);

  console.log("###", account_data);
  return (<React.Fragment>
    {
      name_keys.map((key)=>{
        const ckey = companyed(key);
        let value = account_data[key] || "";
        const disabled = (key === "tax_id") && account_data.tax_id_provided;
        if (disabled) {
          value = "*****";
        }
        return <FormControl key={key} className={classes.form}>
        <TextField error={requirements[ckey]} label={<FormattedMessage id={ckey} />} 
              value={value} disabled={disabled}
              onChange={(e)=>setAccountValue(key, null, e.target.value)} />
      </FormControl>
      })      
    }
    {
      address_keys.map((subkey)=>{
        if (subkey==="postal_code") {
          return false; // no need to show Kanji version of postal code
        }
        const ckey="company.address_kanji."+subkey;
        return <FormControl key={ckey} className={classes.form}>
          <TextField error={requirements[ckey]} label={<FormattedMessage id={"address_kanji."+subkey} />} 
              value={(account_data["address_kanji"]||{})[subkey] || ""} 
              onChange={(e)=>setAccountValue("address_kanji", subkey, e.target.value)} />
        </FormControl>
      })      
    }
    {
      address_keys.map((subkey)=>{
        const ckey="company.address_kana."+subkey;
        return <FormControl key={ckey} className={classes.form}>
          <TextField error={requirements[ckey]} label={<FormattedMessage id={"address_kana."+subkey} />} 
              value={(account_data["address_kana"]||{})[subkey] || ""} 
              onChange={(e)=>setAccountValue("address_kana", subkey, e.target.value)} />
        </FormControl>
      })      
    }
    <FormControl className={classes.form}>
      <TextField error={requirements["company.phone"]} label={<FormattedMessage id="company.phone" />} 
            value={account_data.phone || ""} 
            onChange={(e)=>setAccountValue("phone", null, e.target.value)} />
    </FormControl>
  </React.Fragment>)
}

AccountCompanyJP.propTypes = {
  classes: PropTypes.object.isRequired,
  account_data: PropTypes.object.isRequired,
  requirements: PropTypes.object.isRequired,
  setAccountValue: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountCompanyJP);