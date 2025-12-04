import React, { useEffect, useState } from 'react';
import { StripeProvider, Elements } from 'react-stripe-elements';
import { stripeConfig } from '../../config';


import CardRegistration from '../join/CardRegistration';

function PaymentUpdate(props) {
  const { callbacks, db, group, user } = props;
  const [ customer, setCustomer ] = useState(null);

  const setTabbar = callbacks.setTabbar;
  useEffect(()=> {
    setTabbar("payment.update", "account/payment/update");
  }, [setTabbar]);
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

  function customerDidUpdate(customer) {
    console.log("customerDidUpdate 2", customer);
    setCustomer(customer);
  }
  
  return (
    <StripeProvider apiKey={ stripeConfig.apiKey }>
      <Elements hidePostalCode={true}>
      <CardRegistration customer={customer} didUpdate={customerDidUpdate} isUpdate={true} />
      </Elements>
    </StripeProvider>);
}
export default PaymentUpdate;
  
