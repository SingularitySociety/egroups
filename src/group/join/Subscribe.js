import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
//import { makeStyles } from '@material-ui/core/styles';
//import { Typography } from '@material-ui/core';
//import { FormattedMessage } from 'react-intl';
import PleaseLogin from './PleaseLogin';
import { StripeProvider, Elements } from 'react-stripe-elements';
import InjectedCheckoutForm from './CheckoutForm';

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

  useEffect(()=>{
    setTabbar("subscribe");
  }, [setTabbar]);

  if (!user) {
    return <PleaseLogin />
  }

  // Test card numbers
  // 4242 4242 4242 4242
  const context = { group, db, user, privilege, callbacks };
  return (
    <StripeProvider apiKey="pk_test_iVo1YToPedpru7AJDpAj43cF00ftQJpoj8">
      <Elements>
        <InjectedCheckoutForm {...context} />
      </Elements>
    </StripeProvider>
  )
}

Subscribe.propTypes = {
  group: PropTypes.object.isRequired,
};
  
export default Subscribe;