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
  const { selectTab, user } = props;

  useEffect(()=>{
    selectTab("subscribe");
  }, [selectTab]);

  if (!user) {
    return <PleaseLogin />
  }

  return (
    <StripeProvider apiKey="pk_test_iVo1YToPedpru7AJDpAj43cF00ftQJpoj8">
      <Elements>
        <InjectedCheckoutForm />
      </Elements>
    </StripeProvider>
  )
}

Subscribe.propTypes = {
  group: PropTypes.object.isRequired,
};
  
export default Subscribe;