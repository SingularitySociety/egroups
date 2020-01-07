import React, { useEffect, useState } from 'react';
import { FormattedMessage } from 'react-intl';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Checkbox } from '@material-ui/core';
//import { FormattedMessage } from 'react-intl';
import PleaseLogin from './PleaseLogin';
import { StripeProvider, Elements } from 'react-stripe-elements';
import InjectedCheckoutForm from './CheckoutForm';
import RegisterSMS from '../../auth/RegisterSMS';
import useOnDocument from '../../common/useOnDocument';
import { stripeConfig } from '../../config.js';
import { Redirect } from 'react-router-dom';

const styles = theme => ({
  terms: {
    width: "100%",
    '& > iframe': {
      width: "100%",
    },
  },
});
const useStyles = makeStyles(styles);

function Subscribe(props) {
  const classes = useStyles();
  const { callbacks, user, group, db, privilege, intl } = props;
  const setTabbar = callbacks.setTabbar;
  const [sms] = useOnDocument(db, user && `users/${user.uid}/readonly/sms`);
  const [marioToken, setMarioToken] = useState(null);
  const [agreeTerm, setAgreeTerm] = useState(false);
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

  // todo: make localize iframe link localize
  const terms_file = "/" + (intl.formatMessage({id: "terms_and_conditions.file_name"}) || "terms_en.html");
  const agreeTermElement = <div className={classes.terms}>
                             <FormattedMessage id="terms_and_conditions.header" values={{title: group.title}} />
                             <iframe src={terms_file}/><br/>
                             <Checkbox value={agreeTerm} onChange={(e) => {setAgreeTerm(e.target.checked);}}/>
                             <FormattedMessage id="terms_and_conditions.agree" />
                           </div>;
  if (!agreeTerm) {
    return agreeTermElement;
  }
  
  // Test card numbers
  // 4242 4242 4242 4242
  const context = { group, db, user, privilege, callbacks, marioToken };
  const smsContext = { phone, marioToken, setMarioToken };

  if (!marioToken) {
    return <React.Fragment>{agreeTermElement}<RegisterSMS {...smsContext} /></React.Fragment>;
  }

  return (
    <div>
      <RegisterSMS {...smsContext} />
      <StripeProvider apiKey={ stripeConfig.apiKey }>
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
