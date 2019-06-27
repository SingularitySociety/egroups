import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { makeStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { injectStripe, CardElement } from 'react-stripe-elements';

const styles = theme => ({
  about: {
    color: "red",
  },
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

  return (
    <form>
      <CardElement />
      <Button variant="contained" color="primary" onClick={onSubmit} type="submit">submit</Button>
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