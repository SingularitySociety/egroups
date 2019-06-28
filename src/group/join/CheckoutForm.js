import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button, FormControl, Select, InputLabel } from '@material-ui/core';
import { FormattedMessage, injectIntl } from 'react-intl';
import { injectStripe, CardElement } from 'react-stripe-elements';
import PlanOptions from './PlanOptions';
import * as firebase from "firebase/app";
import "firebase/functions";
import CircularProgress from '@material-ui/core/CircularProgress';

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
  button: {
    marginRight: theme.spacing(1),
  },
  processing: {
    marginLeft: theme.spacing(1),
    position: "absolute",
  }
});
const useStyles = makeStyles(styles);

function CheckoutForm(props) {
  const classes = useStyles();
  const { stripe, group, intl } = props;
  const [ error, setError ] = useState(null);
  const [ planIndex, setPlanIndex ] = useState(0);
  const [ processing, setProcessing ] = useState(false);
  const [ customer, setCustomer ] = useState(null);

  // 4242 4242 4242 4242
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    setProcessing(true);
    const {error, token} = await stripe.createToken({type: 'card', name: 'Jenny Rosen'});
    if (token) {
      console.log(token);
      const createCustomer = firebase.functions().httpsCallable('createCustomer');
      const result = (await createCustomer({token:token.id})).data; 
      console.log(result);
      if (result.result && result.customer) {
        setCustomer(result.customer);
      }
    } else if (error) {
      setError(error.message);
    } else {
      console.log("### unexpected ###");
    }
    setProcessing(false);
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

  if (customer) {
    const { sources:{data:[cardInfo]}} = customer;
    console.log(cardInfo);
    return (
      <form>
        {cardInfo.brand}
        {cardInfo.exp_month}
        {cardInfo.exp_year}
        {cardInfo.last4}
        <br/>
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
        <br/>
      </form>
    )    
  }

  return (
    <form onSubmit={onSubmit}>
      <div className={classes.cardElement} >
        <CardElement style={styleCard} />
      </div>
      <Button variant="contained" color="primary" type="submit" className={classes.button}>
        <FormattedMessage id="card.register" />
      </Button>
      {
        processing && <React.Fragment>
          <FormattedMessage id="card.registering" />
          <CircularProgress size={22} className={classes.processing} />
        </React.Fragment>
      }
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