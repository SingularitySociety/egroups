import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { FormGroup, Switch, FormControlLabel, Fab, TextField, Grid, Button } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  plan: {
    marginBottom: theme.spacing(1),
  },
  add: {
    marginLeft: theme.spacing(2),
  },
  buttons: {
    marginTop: theme.spacing(1),
  },
  button: {
    marginRight: theme.spacing(1),
  }
});

const useStyles = makeStyles(styles);

function SettingsBilling(props) {
  const classes = useStyles();
  const { group, db, selectTab } = props;
  const [subscription, setSubscription] = useState(group.subscription);
  const [plans, setPlans] = useState(group.plans || []);
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
    const newPlans = plans.concat([{}]);
    setPlans(newPlans);
    console.log(newPlans);
  }
  function deletePlan(index) {
    let newPlans = plans;
    newPlans.splice(index, 1);
    setPlans(newPlans);
    console.log(newPlans);
  }
  function onChange(e, field, index) {
    let newPlans = plans;
    let plan = plans[index];
    plan[field] = e.target.value;
    newPlans[index] = plan;
    setPlans(newPlans);
  }
  function onCancel() {
    setPlans(group.plans || []);
  }  
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
              return (
              <Grid container key={index} className={classes.plan}>
                <Grid item xs={5}>
                  <TextField label={"plan.name"} value={plan.name} variant="outlined" 
                    onChange={(e)=>onChange(e, "name", index)} />
                </Grid>
                <Grid item xs={3}>
                  <TextField label={"plan.price"} value={plan.price} variant="outlined" 
                    onChange={(e)=>onChange(e, "price", index)} />
                </Grid>
              </Grid>
              );
            })
          }
          <Fab variant="extended" onClick={addPlan} size="small" className={classes.add}>
              <AddIcon />{"plan.add"}
          </Fab>
          <div className={classes.buttons}>
            <Button variant="contained" color="primary" className={classes.button}>submit</Button>
            <Button variant="contained" onClick={onCancel}>cancel</Button>
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
