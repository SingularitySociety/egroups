import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { injectStripe, CardElement } from 'react-stripe-elements';
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

function CardRegistration(props) {
  const classes = useStyles();
  const { stripe, customer, didUpdate } = props;
  const [ error, setError ] = useState(null);
  const [ processing, setProcessing ] = useState(false);

  // 4242424242424242
  // 5555555555554444
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
        didUpdate(result.customer);
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

  if (customer) {
    // NOTE: We deal with only the default card (index=0)
    const { sources:{data:[cardInfo]}} = customer;
    console.log(cardInfo);
    // 4242 4242 4242 4242
    // 5555555555554444
    return (
      <form>
        <FormattedMessage key={cardInfo.id} id="card.info" values={cardInfo} />;
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

CardRegistration.propTypes = {
  group: PropTypes.object.isRequired,
};
  
export default injectStripe(CardRegistration);