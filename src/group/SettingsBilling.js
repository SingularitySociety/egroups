import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { makeStyles } from '@material-ui/core/styles';
//import Grid from '@material-ui/core/Grid';
import { FormGroup, Switch, FormControlLabel } from '@material-ui/core';

//import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
  subsciption: {
  },
});

const useStyles = makeStyles(styles);

function SettingsBilling(props) {
  const classes = useStyles();
  const { group, db, selectTab } = props;
  const [subscription, setSubscription] = useState(group.subscription);
  const refGroup = db.doc(`groups/${group.groupId}`);

  useEffect(()=>{
    selectTab("settings.billing");
  }, [selectTab]);

  const handleCheck = name => async event => {
    setSubscription(event.target.checked);
    await refGroup.set({[name]:event.target.checked}, {merge:true});
    props.reloadGroup();
  };  
  return (
    <React.Fragment>
      <FormGroup row className={classes.subsciption}>
        <FormControlLabel 
          control={ <Switch checked={subscription} onChange={handleCheck('subscription')} /> }
          label={<FormattedMessage id="subscription.enabled" />}
        />
      </FormGroup>
    </React.Fragment>
  );
}

SettingsBilling.propTypes = {
  reloadGroup: PropTypes.func.isRequired,
};

export default SettingsBilling;
