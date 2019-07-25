import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { TextField } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  field: {
    marginBottom: theme.spacing(1),
  },
});

function AccountCompanyJP(props) {
  const { classes, account_data, requirements, setAccountValue } = props;
  console.log(requirements);
  return (<React.Fragment>
    <div className={classes.field}>
      <TextField error={requirements["company.name"]} label={<FormattedMessage id="company.name" />} 
            value={account_data.name || ""} 
            onChange={(e)=>setAccountValue("name", e.target.value)} />
    </div>
    <div className={classes.field}>
      <TextField error={requirements["company.business_name_kana"]} label={<FormattedMessage id="company.business_name_kana" />} 
            value={account_data.business_name_kana || ""} 
            onChange={(e)=>setAccountValue("business_name_kana", e.target.value)} />
    </div>
    <div className={classes.field}>
      <TextField error={requirements["company.business_name_kanji"]} label={<FormattedMessage id="company.business_name_kanji" />} 
            value={account_data.business_name_kanji || ""} 
            onChange={(e)=>setAccountValue("business_name_kanji", e.target.value)} />
    </div>
    <div className={classes.field}>
      <TextField error={requirements["company.phone"]} label={<FormattedMessage id="company.phone" />} 
            value={account_data.phone || ""} 
            onChange={(e)=>setAccountValue("phone", e.target.value)} />
    </div>
    <div className={classes.field}>
      <TextField error={requirements["company.tax_id"]} label={<FormattedMessage id="company.tax_id" />} 
            value={account_data.tax_id || ""} 
            onChange={(e)=>setAccountValue("tax_id", e.target.value)} />
    </div>
  </React.Fragment>)
}

AccountCompanyJP.propTypes = {
  classes: PropTypes.object.isRequired,
  account_data: PropTypes.object.isRequired,
  requirements: PropTypes.object.isRequired,
  setAccountValue: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountCompanyJP);