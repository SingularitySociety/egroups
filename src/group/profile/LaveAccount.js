import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button, Typography } from '@material-ui/core';
import { FormattedMessage, FormattedDate } from 'react-intl';
import LockedArea from '../../common/LockedArea';
import Privileges from '../../const/Privileges';
import useDocument from '../../common/useDocument';

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
  const [stripe] = useDocument(db, path);
  
  const handleLeave = async () => {
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    await refMember.delete();
    callbacks.memberDidUpdate();
    window.location.pathname = "/"; // + group.groupName;
  }

  const role = roleMap(privilege);
  const roleId = `account.${role}`;
  const joinedDate = <FormattedDate value={member.created.toDate()} />
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
    if (stripe && stripe.period && stripe.subscription) {
      const { period:{start, end}, subscription:{plan} } = stripe;
      console.log(start, end, plan, group.plans);
      group.plans.forEach((item)=>{
        if (item.price === plan.amount && item.currency === plan.currency) {
          planName = item.name;
        }
      })
      price = <FormattedMessage id={`monthly.fee.${plan.currency}`} 
            values={{price:plan.amount}} />
      const date = <FormattedDate value={new Date(end * 1000)} />
      billing =  <FormattedMessage id="next.billing" values={{ date }}/>
    }
    return <div>
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
    </div>;
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
  </React.Fragment>
}

LeaveAccount.propTypes = {
  classes: PropTypes.object.isRequired,
  callbacks: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(LeaveAccount);