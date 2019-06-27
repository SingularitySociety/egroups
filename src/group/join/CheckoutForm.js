import React, { useState } from 'react';
//import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
//import { FormattedMessage } from 'react-intl';
import { injectStripe, CardElement } from 'react-stripe-elements';

const styles = theme => ({
  about: {
    color: "red",
  },
  cardElement: {
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(1),
  }
});
const useStyles = makeStyles(styles);

function CheckoutForm(props) {
  const classes = useStyles();
  const { stripe } = props;
  const [ error, setError ] = useState(null);
  
  async function onSubmit(e) {
    e.preventDefault();
    setError(null);
    const token = await stripe.createToken({type: 'card', name: 'Jenny Rosen'});
    console.log(token);
    if (token.error) {
      setError(token.error.message);
    }
  }

  const styleCard = {
    base: {
      fontSize: '14px',
    }
  };

  return (
    <form onSubmit={onSubmit}>
      <div className={classes.cardElement} >
        <CardElement style={styleCard} />
      </div>
      <Button variant="contained" color="primary" type="submit">submit</Button>
      {
        error &&
          <Typography color="error">{error}</Typography>
      }
    </form>
  )
}

CheckoutForm.propTypes = {
  ///classes: PropTypes.object.isRequired,
};
  
export default injectStripe(CheckoutForm);