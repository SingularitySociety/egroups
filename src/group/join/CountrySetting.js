import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import CountryOptions from '../../options/CountryOptions';
import { FormControl, InputLabel, Select, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import * as firebase from "firebase/app";
import "firebase/functions";

const styles = theme => ({
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(2),
  },
  button: {
    marginBottom: theme.spacing(2),
  }
});

function CountrySetting(props) {
  const { classes, group } = props;
  const groupId = group.groupId;
  const [country, setCountry] = useState("JP");

  function handleChange(e) {
    setCountry(e.currentTarget.value);
  }
  async function onSubmit(e) {
    const context = { country, groupId };
    const createCustomAccount = firebase.functions().httpsCallable('createCustomAccount');
    const result = (await createCustomAccount(context)).data;
    console.log(result);
  }
  return <div>
    <FormControl className={classes.formControl}>
      <InputLabel><FormattedMessage id="billing.country" /></InputLabel>
      <Select native value={country}　onChange={handleChange}>
        <CountryOptions />
      </Select>
    </FormControl>
    <br/>
    <Button variant="contained" onClick={onSubmit} className={ classes.button }>
      <FormattedMessage id="submit" />
    </Button>
  </div>;
}

CountrySetting.propTypes = {
  classes: PropTypes.object.isRequired,
  group: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(CountrySetting);
  