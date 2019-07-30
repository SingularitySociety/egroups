import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { TextField, FormControl } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
    form: {
      marginRight: theme.spacing(1),
      marginBottom: theme.spacing(1),
      width: '22rem',
    },
  });

function AccountBankJP(props) {
  const { bank_data, setBankData, classes } = props;
  function setBankValue(key, value) {
    const new_data = (() => {
      if (bank_data) {
        return Object.assign({}, bank_data);
      } 
      return { object:"bank_account", country:"JP", currency:"jpy" };
    })();
    new_data[key] = value;
    setBankData(new_data);
  }

  return (<React.Fragment>
    {
      ["routing_number", "account_number", "account_holder_name"].map((key)=>{
        return <FormControl key={key} className={classes.form}>
        <TextField error={true} label={<FormattedMessage id={key} />} 
              value={(bank_data && bank_data[key]) || ""} 
              onChange={(e)=>setBankValue(key, e.target.value)} />
      </FormControl>
      })      
    }</React.Fragment>);
}

AccountBankJP.propTypes = {
  classes: PropTypes.object.isRequired,
  setBankData: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountBankJP);
