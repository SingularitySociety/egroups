import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormControl, Select, InputLabel } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import PlanOptions from './PlanOptions';
import CardRegistration from './CardRegistration';

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
  const { group } = props;
  const [ planIndex, setPlanIndex ] = useState(0);
  const [ customer, setCustomer ] = useState(null);

  // 4242424242424242
  // 5555555555554444
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
          <FormattedMessage id={"monthly.fee."+group.plans[planIndex].currency}
            values = {{
              price: group.plans[planIndex].price,
            }} />
        </FormControl>
      </form>
  }
  </React.Fragment>;
}

CheckoutForm.propTypes = {
  group: PropTypes.object.isRequired,
};
  
export default CheckoutForm;