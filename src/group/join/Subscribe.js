import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
//import { makeStyles } from '@material-ui/core/styles';
//import { Typography } from '@material-ui/core';
//import { FormattedMessage } from 'react-intl';
import PleaseLogin from './PleaseLogin';
import { StripeProvider, Elements } from 'react-stripe-elements';
import InjectedCheckoutForm from './CheckoutForm';
import RegisterSMS from '../../auth/RegisterSMS';
import useOnDocument from '../../common/useOnDocument';
import { stripeConfig } from '../../config.js';
import { Redirect } from 'react-router-dom';

/*
const styles = theme => ({
  about: {
    color: "red",
  },
});
const useStyles = makeStyles(styles);
*/

function Subscribe(props) {
  //const classes = useStyles();
  const { callbacks, user, group, db, privilege } = props;
  const setTabbar = callbacks.setTabbar;
  const [sms] = useOnDocument(db, user && `users/${user.uid}/readonly/sms`);
  const [marioToken, setMarioToken] = useState(null);
  const phone = sms && sms.phoneNumber;

  useEffect(()=>{
    setTabbar("subscribe");
  }, [setTabbar]);

  if (!user) {
    return <PleaseLogin />;
  }

  if (privilege) {
    return <Redirect to={`/g/${group.groupName}/member`} />;
  }

  // Test card numbers
  // 4242 4242 4242 4242
  const context = { group, db, user, privilege, callbacks, marioToken };
  const smsContext = { phone, marioToken, setMarioToken };

  if (!marioToken) {
    return <RegisterSMS {...smsContext} />;
  }

  return (
    <div>
      <RegisterSMS {...smsContext} />
      <StripeProvider apiKey={ stripeConfig.apiKey } hidePostalCode={true}>
        <Elements>
          <InjectedCheckoutForm {...context} />
        </Elements>
      </StripeProvider>
    </div>
  );
}

Subscribe.propTypes = {
  group: PropTypes.object.isRequired,
};
  
export default Subscribe;
