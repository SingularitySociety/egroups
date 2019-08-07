import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
//import * as firebase from "firebase/app";
//import "firebase/functions";
import { FormControlLabel, Switch, Typography, Link } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';

const styles = theme => ({
    accepted: {
      marginBottom: theme.spacing(1),
    },
    acceptance: {
      marginBottom: theme.spacing(1),
    }
  });

export function accept_data_required(requirements) {
  const keys = ["tos_acceptance.date"];
  return keys.reduce((summary, key)=>{
    return summary || requirements[key];
  }, false);
}
  
function AccountAccept(props) {
  const { setAcceptance, acceptance, requirements, classes, setPage } = props;
  useEffect(()=>{
    setPage("acceptance");
  }, [setPage]);

  useEffect(()=>{
    return () => {
      setAcceptance(false);
    };
  }, [setAcceptance])

  //console.log(requirements);
  if (!requirements["tos_acceptance.ip"]) {
    return (
      <Typography className={classes.accepted}>
        <FormattedMessage id="acceptance.complete" />
      </Typography> 
    );
  }

  return (<React.Fragment>
      <FormControlLabel
        className={classes.acceptance}
        control={
          <Switch
            checked={acceptance}
            onChange={(e)=>{setAcceptance(e.target.checked)}}
            color="primary"
          />
        }
        label={<FormattedMessage id="do.accept" />}
      />
      <Typography>
      By registering your account, you agree to our Services Agreement
      and the&nbsp;
      <Link to="https://stripe.com/ja-us/connect-account/legal">
        Stripe Connected Account Agreement</Link>.
      </Typography>
    </React.Fragment>);
}

AccountAccept.propTypes = {
  classes: PropTypes.object.isRequired,
  requirements: PropTypes.object.isRequired,
  setAcceptance: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountAccept);
