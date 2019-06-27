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
  buttons: {
    marginTop: theme.spacing(1),
  },
  button: {
    marginRight: theme.spacing(1),
    width: "6rem",
  }
});

const useStyles = makeStyles(styles);

function SettingsBilling(props) {
  const classes = useStyles();
  const { group, db, selectTab } = props;
  const [subscription, setSubscription] = useState(group.subscription);
  const [plans, setPlans] = useState(group.plans || []);
  const [modified, setModified] = useState(false);
  const refGroup = db.doc(`groups/${group.groupId}`);

  useEffect(()=>{
    selectTab("settings.billing");
    console.log("useEffect");
  }, [selectTab]);

  const handleCheck = name => async event => {
    setSubscription(event.target.checked);
    await refGroup.set({[name]:event.target.checked}, {merge:true});
    props.reloadGroup();
  };

  function addPlan() {
    const newPlans = plans.concat([{name:"", price:""}]);
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
    props.reloadGroup();
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
              <Grid container key={index} className={classes.plan}>
                <Grid item xs={5}>
                  <TextField error={!isNameValid} label={<FormattedMessage id="plan.name" />} 
                    value={plan.name} variant="outlined" 
                    onChange={(e)=>onChange(e.target.value, "name", index)} />
                </Grid>
                <Grid item xs={3}>
                  <TextField error={!isPriceValid} label={<FormattedMessage id="plan.price" />} 
                    value={plan.price} variant="outlined" 
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
  reloadGroup: PropTypes.func.isRequired,
};

export default SettingsBilling;
