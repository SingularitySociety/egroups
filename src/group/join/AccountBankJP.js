import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { TextField, FormControl } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import BankCode from '../../common/BankCode';

const styles = theme => ({
    form: {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1),
      width: '22rem',
    },
  });

export function extract_bank_data(data) {
  return { 
    object:"bank_account",
    saved:true,
    routing_number: data.routing_number,
    account_number: "***"+data.last4,
    account_holder_type: data.account_holder_type,
    account_holder_name: data.account_holder_name,
    country:data.country,
    currency:data.currency,
  };
}

export function bank_data_required(requirements) {
  const keys = ["external_account"];
  return keys.reduce((summary, key)=>{
    return summary || requirements[key];
  }, false);
}

function AccountBankJP(props) {
  const { db, bank_data, setBankData, setPage, classes, business_type } = props;

  useEffect(()=>{
    setPage("bank");
  }, [setPage]);
  function setBankValue(key, value) {
    const new_data = (() => {
      if (bank_data) {
        return Object.assign({}, bank_data);
      } 
      return { object:"bank_account", country:"JP", currency:"jpy", 
                account_holder_type:business_type };
    })();
    new_data[key] = value;
    setBankData(new_data);
  }

  function setRoutingNumber(number) {
    console.log(number);
    setBankValue("routing_number", number);
  }

  const valid = bank_data && bank_data.saved;
  return (<React.Fragment>
            <BankCode db={db} setRoutingNumber={setRoutingNumber} routingNumber={bank_data && bank_data.routing_number} valid={valid} />
    {
      ["routing_number", "account_number", "account_holder_name"].map((key)=>{
        return <FormControl key={key} className={classes.form}>
        <TextField error={!valid} label={<FormattedMessage id={key} />}
              disabled={false && key==="routing_number"} // TESTING 
              value={(bank_data && bank_data[key]) || ""} 
              onChange={(e)=>setBankValue(key, e.target.value)} />
               </FormControl>;
      })      
    }</React.Fragment>);
}

AccountBankJP.propTypes = {
  classes: PropTypes.object.isRequired,
  db: PropTypes.object.isRequired,
  setBankData: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountBankJP);
