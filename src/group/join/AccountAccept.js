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
  }, [setAcceptance]);

  //console.log(requirements);
  if (!requirements["tos_acceptance.ip"]) {
    return (
      <React.Fragment>
        <Typography className={classes.accepted}>
          <FormattedMessage id="acceptance.complete" />
        </Typography> 
        <ul>
          <li>
            <Link href="https://stripe.com/ja-us/connect-account/legal" rel="noopener" target="_blank">
              <FormattedMessage id="stripe.agreement" />
            </Link>
          </li>        
        </ul>
      </React.Fragment>
    );
  }

  return (<React.Fragment>
      <Typography>
        <FormattedMessage id="please.agree" />
      </Typography>
      <ul>
        <li>
          <Link href="https://stripe.com/ja-us/connect-account/legal" rel="noopener" target="_blank">
            <FormattedMessage id="stripe.agreement" />
          </Link>
        </li>        
      </ul>
      <FormControlLabel
        className={classes.acceptance}
        control={
          <Switch
            checked={acceptance}
            onChange={(e)=>{setAcceptance(e.target.checked);}}
            color="primary"
          />
        }
        label={<FormattedMessage id="do.accept" />}
      />
    </React.Fragment>);
}

AccountAccept.propTypes = {
  classes: PropTypes.object.isRequired,
  requirements: PropTypes.object.isRequired,
  setAcceptance: PropTypes.func.isRequired,
  setPage: PropTypes.func.isRequired,
};
  
export default withStyles(styles)(AccountAccept);
