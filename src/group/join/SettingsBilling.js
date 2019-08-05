import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
import { Fab, TextField, Grid, Button, IconButton, Typography } from '@material-ui/core';
import AddIcon from '@material-ui/icons/Add';
import DeleteIcon from '@material-ui/icons/Delete';
import { FormattedMessage } from 'react-intl';
import CountrySetting from './CountrySetting';
import useOnDocument from '../../common/useOnDocument';
import { Link } from 'react-router-dom';
import Processing from '../../common/Processing';

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
    marginBottom: theme.spacing(1),
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
  const groupId = group.groupId;
  const subscription = group.subscription;
  const [plans, setPlans] = useState(group.plans || []);
  const [modified, setModified] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [account] = useOnDocument(db, `groups/${groupId}/private/account`);
  const setTabbar = callbacks.setTabbar;

  useEffect(()=>{
    setTabbar("settings.billing");
  }, [setTabbar]);

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
    setProcessing(true);
    plans.sort((a, b) => { return a.price - b.price });
    const refGroup = db.doc(`groups/${groupId}`);
    await refGroup.set({plans:plans}, {merge:true});
    props.callbacks.groupDidUpdate();
    setModified(false);
    setProcessing(false);
  }
  let isValid = true;
  if (!subscription) {
    return "";
  }
  if (!account) {
    return <CountrySetting group={group} account={account}/>
  }
  return (
    <div>
      <CountrySetting group={group} account={account}/>
      <Typography variant="h4" component="h4">
          <FormattedMessage id="title.plans" />
      </Typography>
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
        <Processing active={processing} />
      </div>
      {
        plans.length>0 && isValid && !modified &&
        <div>
          <Button variant="contained" color="primary" component={Link} to={`/${group.groupName}/settings/bank`}>
            <FormattedMessage id="settings.bank" />
          </Button>
        </div>
      }
    </div>
  );
}

SettingsBilling.propTypes = {
  callbacks: PropTypes.object.isRequired,
};

export default SettingsBilling;
