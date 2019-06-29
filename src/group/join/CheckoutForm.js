import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormControl, Select, InputLabel } from '@material-ui/core';
import { FormattedMessage, injectIntl } from 'react-intl';
import PlanOptions from './PlanOptions';
import CardRegistration from './CardRegistration';
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
  const { group, intl } = props;
  const [ planIndex, setPlanIndex ] = useState(0);
  const [ customer, setCustomer ] = useState(null);

  // 4242 4242 4242 4242

  function onChangePlan(e) {
    console.log(e.target.value);
    setPlanIndex(e.target.value);
  }

  function customerDidUpdate(customer) {
    setCustomer(customer);
  }

  return <React.Fragment>
    <CardRegistration customer={customer} didUpdate={customerDidUpdate} />
    { customer &&
      <form>
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
      </form>
  }
  </React.Fragment>;
 
  /*
  if (customer) {
    // NOTE: We deal with only the default card (index=0)
    const { sources:{data:[cardInfo]}} = customer;
    console.log(cardInfo);
    // 4242 4242 4242 4242
    // 5555555555554444
    return (
      <form>
        <FormattedMessage key={cardInfo.id} id="card.info" values={cardInfo} />;
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
  */
}

CheckoutForm.propTypes = {
  group: PropTypes.object.isRequired,
};
  
export default injectIntl(CheckoutForm);