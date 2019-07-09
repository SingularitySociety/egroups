import React from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import LockedArea from '../../common/LockedArea';
import Privileges from '../../const/Privileges';

const styles = theme => ({
  button: {
      margin: theme.spacing(1)
  }
});

function LeaveAccount(props) {
  const { db, user, group, callbacks, privilege } = props;
  const { classes } = props;
  
  const handleLeave = async () => {
    const refMember = db.doc(`groups/${group.groupId}/members/${user.uid}`);
    await refMember.delete();
    callbacks.memberDidUpdate();
    window.location.pathname = "/"; // + group.groupName;
  }

  return <div>
    {
      privilege < Privileges.owner &&    
      <LockedArea label={<FormattedMessage id="warning.dangerous" />}>
        <Button variant="contained" className={classes.button} onClick={handleLeave}>
          <FormattedMessage id="leave" />
        </Button>
      </LockedArea>
    }
  </div>
}

LeaveAccount.propTypes = {
  classes: PropTypes.object.isRequired,
  callbacks: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(LeaveAccount);