import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';
import { FormattedMessage, FormattedDate } from 'react-intl';
import LockedArea from '../../common/LockedArea';
import Privileges from '../../const/Privileges';
import useOnDocument from '../../common/useOnDocument';
import * as firebase from "firebase/app";
import "firebase/functions";
import CircularProgress from '@material-ui/core/CircularProgress';
import { Link } from 'react-router-dom';

const styles = theme => ({
  button: {
      margin: theme.spacing(1)
  }
});

function roleMap(privilege) {    
  switch(privilege) {
    case Privileges.guest: return "guest";
    case Privileges.owner: return "owner";
    case Privileges.admin: return "admin";
    case Privileges.mentor: return "mentor";
    case Privileges.subscriber: return "subscriber";
    case Privileges.member: return "member";
    default: return "unknown";
  }
}

function LeaveAccount(props) {
  const { db, user, group, callbacks, privilege, member } = props;
  const { classes } = props;
  const path = user ? `/groups/${group.groupId}/members/${user.uid}/private/stripe` : null;
  const [stripe] = useOnDocument(db, path);
  const [ processing, setProcessing ] = useState(false);
  
  const handleLeave = async () => {
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    await refMember.delete();
    callbacks.memberDidUpdate();
    window.location.pathname = "/"; 
  };

  // cancel:true means we are unsubscribing
  // cancel:false means we are re-subscribing
  async function handleUnsubscribe(cancel) {
    const cancelSubscription = firebase.functions().httpsCallable('cancelSubscription');
    const context = { groupId:group.groupId, cancel };
    setProcessing(true);
    try {
      const result = (await cancelSubscription(context)).data;
      if (result.result === false) {
        console.log(result);
      }
    } catch(e) {
      console.log(e);
    }
    setProcessing(false);
  }

  const role = roleMap(privilege);
  const roleId = `account.${role}`;
  const joinedDate = <FormattedDate value={member.created.toDate()} />;
  if (privilege === Privileges.owner) {
    return <div>
      <Typography>
        <FormattedMessage id={roleId} values={{ joinedDate }} />
      </Typography>
    </div>;
  }

  if (privilege === Privileges.subscriber) {
    let planName = null;
    let price = null;
    let billing = null;
    let cancelled = false;
    if (stripe && stripe.period && stripe.subscription) {
      const { period:{end}, subscription:{plan} } = stripe;
      cancelled = stripe.subscription.cancel_at_period_end;
      //console.log(stripe, cancelled);

      group.plans.forEach((item)=>{
        if (item.price === plan.amount && item.currency === plan.currency) {
          planName = item.name;
        }
      });
      price = <FormattedMessage id={`monthly.fee.${plan.currency}`} 
                                values={{price:plan.amount}} />;
      const date = <FormattedDate value={new Date(end * 1000)} />;
      billing =  <FormattedMessage id={cancelled ? "expire.billing" : "next.billing"} values={{ date }}/>;
    }
    return <React.Fragment>
      <div>
        { planName &&
        <Typography component="h4" variant="h4">
          { planName }
        </Typography>
        }
        <Typography>
          <FormattedMessage id={roleId} values={{ joinedDate }}/> <br/>
          { price } <br/>
          { billing }
        </Typography>
        <Typography>
          <Button className={classes.button} variant="contained" component={Link} to={`/g/${group.groupName}/account/payment/log`}>
            <FormattedMessage id="payment.log" />
          </Button>
          <Button className={classes.button} variant="contained" component={Link} to={`/g/${group.groupName}/account/payment/update`}>
            <FormattedMessage id="payment.update" />
          </Button>
        </Typography>
      </div>
      <div>
      {
        cancelled ? <div>
          <Button variant="contained" className={classes.button} 
                  onClick={()=>{handleUnsubscribe(false);}}>
            <FormattedMessage id={ cancelled ? "resubscribe" : "unsubscribe" } />
          </Button>
          {
            processing && 
            <CircularProgress size={24} />
          }
        </div>
        :
        <LockedArea label={<FormattedMessage id="warning.dangerous" />}>
          <Button variant="contained" className={classes.button} 
                  onClick={()=>{handleUnsubscribe(true);}}>
            <FormattedMessage id={ cancelled ? "resubscribe" : "unsubscribe" } />
          </Button>
          {
          processing && 
          <CircularProgress size={24} />
          }
        </LockedArea>
      }
    </div>
    </React.Fragment>;
  }

  return <React.Fragment>
    <div>
      <Typography component="h4" variant="h4">
        <FormattedMessage id={role} />
      </Typography>
      <Typography>
        <FormattedMessage id={roleId} values={{ joinedDate }} />
      </Typography>
    </div>
    <div>
      <LockedArea label={<FormattedMessage id="warning.dangerous" />}>
        <Button variant="contained" className={classes.button} onClick={handleLeave}>
          <FormattedMessage id="leave" />
        </Button>
      </LockedArea>
    </div>
  </React.Fragment>;
}

LeaveAccount.propTypes = {
  classes: PropTypes.object.isRequired,
  callbacks: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(LeaveAccount);
