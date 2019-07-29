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

function AccountCompanyPersonJP(props) {
  const { classes, personal_data, requirements, setPersonValue } = props;
  console.log(requirements);
  return (<React.Fragment>
    {
      person_keys.map((key)=>{
        return <FormControl key={key} className={classes.form}>
        <TextField label={<FormattedMessage id={"individual."+key} />} 
              value={personal_data[key] || ""} 
              onChange={(e)=>setPersonValue(key, null, e.target.value)} />
      </FormControl>
      })      
    }
    <br/>
    {
      dob_keys.map((key)=>{
        return <FormControl key={key} className={classes[key]}>
        <TextField label={<FormattedMessage id={"individual.dob."+key} />} 
              value={(personal_data.dob && personal_data.dob[key]) || ""} 
              onChange={(e)=>setPersonValue("dob", key, e.target.value)} />
      </FormControl>
      })      
    }
  </React.Fragment>)
}

AccountCompanyPersonJP.propTypes = {
  classes: PropTypes.object.isRequired,
  personal_data: PropTypes.object.isRequired,
  requirements: PropTypes.object.isRequired,
  setPersonValue: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountCompanyPersonJP);