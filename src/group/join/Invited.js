import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import Processing from '../../common/Processing';
import * as firebase from "firebase/app";
import "firebase/functions";

const styles = theme => ({
  message: {
    marginBottom: theme.spacing(1),
  }
});

function Invited(props) {
  const { classes, callbacks, group, match:{params:{inviteId, inviteKey}} } = props;
  const groupId = group.groupId;
  const setTabbar = callbacks.setTabbar;
  const [processing, setProcessing] = useState(false);

  console.log(groupId, inviteId, inviteKey);

  async function handleJoin() {
    setProcessing(true);
    const context = { groupId, inviteId, inviteKey };
    const processInvite = firebase.functions().httpsCallable('processInvite');
    const result = (await processInvite(context)).data;
    setProcessing(false);
    console.log(result);
  }

  useEffect(()=>{
    setTabbar("invited");
  }, [setTabbar]);

  return <div>
    <Typography className={classes.message}>
      <FormattedMessage id="you.are.invited" />
    </Typography>
    <Button variant="contained" color="primary" onClick={handleJoin} className={classes.button}>
      <FormattedMessage id="join" />
    </Button>
    <Processing active={processing} />
    </div>;
}

Invited.propTypes = {
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Invited);