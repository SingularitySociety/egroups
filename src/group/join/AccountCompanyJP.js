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
    marginBottom: theme.spacing(1),
    width: '20rem',
  },
});

function companyed(key) {
  switch(key) {
    case "name_kana": return "company.business_name_kana";
    case "name_kanji": return "company.business_name_kanji"; 
    default: return "company."+key;
  }
}

function AccountCompanyJP(props) {
  const { classes, account_data, requirements, setAccountValue } = props;
  console.log(requirements);
  return (<React.Fragment>
    {
      ["name", "name_kana", "name_kanji", "tax_id"].map((key)=>{
        const ckey = companyed(key);
        return <FormControl key={key} className={classes.form}>
        <TextField error={requirements[ckey]} label={<FormattedMessage id={ckey} />} 
              value={account_data[key] || ""} 
              onChange={(e)=>setAccountValue(key, e.target.value)} />
      </FormControl>
      })      
    }
    <FormControl className={classes.form}>
      <TextField error={requirements["company.phone"]} label={<FormattedMessage id="company.phone" />} 
            value={account_data.phone || ""} 
            onChange={(e)=>setAccountValue("phone", e.target.value)} />
    </FormControl>
  </React.Fragment>)
}

AccountCompanyJP.propTypes = {
  classes: PropTypes.object.isRequired,
  account_data: PropTypes.object.isRequired,
  requirements: PropTypes.object.isRequired,
  setAccountValue: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountCompanyJP);