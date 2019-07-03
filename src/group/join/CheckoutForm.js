import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormControl, Select, InputLabel, Typography, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import PlanOptions from './PlanOptions';
import CardRegistration from './CardRegistration';
import * as firebase from "firebase/app";
import "firebase/functions";
import CircularProgress from '@material-ui/core/CircularProgress';

const styles = theme => ({
  about: {
    color: "red",
  },
  formControl: {
    width:theme.spacing(38),
    marginBottom: theme.spacing(2),
  },
});
const useStyles = makeStyles(styles);

function CheckoutForm(props) {
  const classes = useStyles();
  const { db, group, user } = props;
  const planLength = (group.plans && group.plans.length) || 0;
  const [ planIndex, setPlanIndex ] = useState(planLength - 1);
  const [ customer, setCustomer ] = useState(null);
  const [ processing, setProcessing ] = useState(false);

  useEffect(()=>{
    async function foo() {
      const ref = db.doc(`users/${user.uid}/private/stripe`);
      const doc = await ref.get();
      const stripe = doc.data();
      if (stripe && stripe.customer) {
        setCustomer({sources:{data:stripe.customer}});
      }
    }
    foo();
  },[db, group, user]);

  // 4242424242424242
  // 5555555555554444
  function onChangePlan(e) {
    console.log(e.target.value);
    setPlanIndex(e.target.value);
  }

  function customerDidUpdate(customer) {
    setCustomer(customer);
  }

  async function subscribe() {
    const plan = group.plans[planIndex];
    const displayName = user.displayName;
    const groupId = group.groupId;
    const context = { groupId, plan, displayName };
    console.log("subscribe", context);
    
    const createSubscribe = firebase.functions().httpsCallable('createSubscribe');
    setProcessing(true);
    const result = (await createSubscribe(context)).data;
    setProcessing(false);
    console.log(result);
  }

  return <React.Fragment>
    <CardRegistration customer={customer} didUpdate={customerDidUpdate} />
    { planLength > 0 ?
      <form>
        <FormControl className={classes.formControl}>
          <InputLabel><FormattedMessage id="plan.name" /></InputLabel>
          <Select native value={planIndex}　onChange={onChangePlan}>
            <PlanOptions plans={group.plans} />
          </Select>
        </FormControl>
        <br/>
        <FormControl className={classes.formControl}>
          <FormattedMessage id={"monthly.fee."+group.plans[planIndex].currency}
            values = {{
              price: group.plans[planIndex].price,
            }} />
        </FormControl>
        <Button variant="contained" color="primary" onClick={subscribe}>
          <FormattedMessage id="do.subscribe" />
        </Button>
        {
          processing && 
          <CircularProgress size={24} />
        }
      </form>
    :
      <Typography color="error"><FormattedMessage id="plan.empty" /></Typography>
    }
  </React.Fragment>;
}

CheckoutForm.propTypes = {
  db: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  group: PropTypes.object.isRequired,
};
  
export default CheckoutForm;