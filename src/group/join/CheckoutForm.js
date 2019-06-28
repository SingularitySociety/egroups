import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button, FormControl, Select, InputLabel } from '@material-ui/core';
import { FormattedMessage, injectIntl } from 'react-intl';
import { injectStripe, CardElement } from 'react-stripe-elements';
import PlanOptions from './PlanOptions';
import * as firebase from "firebase/app";
import "firebase/functions";

const styles = theme => ({
  about: {
    color: "red",
  },
  cardElement: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  },
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(2),
  },
});
const useStyles = makeStyles(styles);

function CheckoutForm(props) {
  const classes = useStyles();
  const { stripe, group, intl } = props;
  const [ error, setError ] = useState(null);
  const [ planIndex, setPlanIndex ] = useState(0);
  
  // 4242 4242 4242 4242
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const {error, token} = await stripe.createToken({type: 'card', name: 'Jenny Rosen'});
    if (token) {
      console.log(token);
      const createCustomer = firebase.functions().httpsCallable('createCustomer');
      const customer = (await createCustomer({token})).data; 
      console.log(customer);
    } else if (error) {
      setError(error.message);
    } else {
      console.log("### unexpected ###");
    }
  }

  const styleCard = {
    base: {
      fontSize: '14px',
    }
  };

  function onChangePlan(e) {
    console.log(e.target.value);
    setPlanIndex(e.target.value);
  }

  return (
    <form onSubmit={onSubmit}>
      <FormControl className={classes.formControl}>
        <InputLabel><FormattedMessage id="plan.name" /></InputLabel>
        <Select native value={planIndex}　onChange={onChangePlan}>
          <PlanOptions plans={group.plans} />
        </Select>
      </FormControl>
      <br/>
      <FormControl className={classes.formControl}>
        {intl.formatMessage({id:"monthly.fee"})}
        :&nbsp;{group.plans[planIndex].price}
        &nbsp;{intl.formatMessage({id:group.plans[planIndex].currency})}
        &nbsp;{intl.formatMessage({id:"plus.tax"})}
      </FormControl>
      <div className={classes.cardElement} >
        <CardElement style={styleCard} />
      </div>
      <Button variant="contained" color="primary" type="submit">
        <FormattedMessage id="subscribe" />
      </Button>
      {
        error &&
          <Typography color="error">{error}</Typography>
      }
    </form>
  )
}

CheckoutForm.propTypes = {
  group: PropTypes.object.isRequired,
};
  
export default injectIntl(injectStripe(CheckoutForm));