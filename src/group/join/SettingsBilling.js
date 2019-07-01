import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormGroup, Switch, FormControlLabel, Fab, TextField, Grid, Button, IconButton } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  subsciption: {
    marginBottom: theme.spacing(1),
  },
  plan: {
    marginBottom: theme.spacing(1),
  },
  add: {
    marginLeft: theme.spacing(1),
  },
  textField: {
    width: "100%",
  },
  buttons: {
    marginTop: theme.spacing(2),
  },
  button: {
    marginRight: theme.spacing(1),
    width: "6rem",
  }
});

const useStyles = makeStyles(styles);

function SettingsBilling(props) {
  const classes = useStyles();
  const { group, db, callbacks } = props;
  const [subscription, setSubscription] = useState(group.subscription);
  const [plans, setPlans] = useState(group.plans || []);
  const [modified, setModified] = useState(false);
  const refGroup = db.doc(`groups/${group.groupId}`);

  useEffect(()=>{
    callbacks.setTabbar("settings.billing");
    console.log("useEffect");
  }, [callbacks]);

  const handleCheck = name => async event => {
    setSubscription(event.target.checked);
    await refGroup.set({[name]:event.target.checked}, {merge:true});
    props.callbacks.groupDidUpdate();
  };

  function addPlan() {
    // LATER: jpy is default for now. In usd, the price is in cents not in dollar. 
    const newPlans = plans.concat([{name:"", price:"", currency:"jpy"}]);
    setPlans(newPlans);
    setModified(true);
  }
  function deletePlan(index) {
    let newPlans = plans.concat([]); // deep copy
    newPlans.splice(index, 1);
    setPlans(newPlans);
    setModified(true);
  }
  function onChange(value, field, index) {
    let newPlans = plans.concat([]); // deep copy
    let plan = {...plans[index]}; // deep copy
    plan[field] = value;
    newPlans[index] = plan;
    setPlans(newPlans);
    setModified(true);
  }
  function onCancel() {
    setPlans(group.plans || []);
    setModified(false);
  }
  async function onUpdate() {
    plans.sort((a, b) => { return a.price - b.price });
    await refGroup.set({plans:plans}, {merge:true});
    props.callbacks.groupDidUpdate();
    setModified(false);
  }
  let isValid = true;
  return (
    <React.Fragment>
      <FormGroup row className={classes.subsciption}>
        <FormControlLabel 
          control={ <Switch checked={subscription} onChange={handleCheck('subscription')} /> }
          label={<FormattedMessage id="subscription.enabled" />}
        />
      </FormGroup>
      {
        subscription && <form>
          {
            plans.map((plan, index)=>{
              const isNameValid = plan.name.length > 0;
              const isPriceValid = plan.price > 0;
              isValid = isValid && isNameValid && isPriceValid;
              return (
              <Grid container direction="row" key={index} className={classes.plan} spacing={1}>
                <Grid item xs={6}>
                  <TextField error={!isNameValid} label={<FormattedMessage id="plan.name" />} 
                    value={plan.name} variant="outlined" className={classes.textField}
                    onChange={(e)=>onChange(e.target.value, "name", index)} />
                </Grid>
                <Grid item xs={4}>
                  <TextField error={!isPriceValid} label={<FormattedMessage id="plan.price" />} 
                    value={plan.price} variant="outlined" className={classes.textField}
                    onChange={(e)=>onChange(parseInt(e.target.value) || "", "price", index)} />
                </Grid>
                <Grid item xs={1}>
                  <IconButton onClick={()=>{deletePlan(index)}}>
                    <DeleteIcon />
                  </IconButton>
                </Grid>
              </Grid>
              );
            })
          }
          <Fab variant="extended" onClick={addPlan} size="small" className={classes.add}>
              <AddIcon /><FormattedMessage id="plan.add"/>
          </Fab>
          <div className={classes.buttons}>
            <Button variant="contained" color="primary" onClick={onUpdate} className={classes.button} disabled={!modified || !isValid}>
              <FormattedMessage id="update" />
            </Button>
            <Button variant="contained" onClick={onCancel} className={classes.button} disabled={!modified}>
            <FormattedMessage id="cancel" />
            </Button>
          </div>
        </form>
      }
    </React.Fragment>
  );
}

SettingsBilling.propTypes = {
  callbacks: PropTypes.object.isRequired,
};

export default SettingsBilling;
