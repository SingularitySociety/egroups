import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import ResultMessage from '../../common/ResultMessage';
import Processing from '../../common/Processing';

const styles = theme => ({
});

function BankAccount(props) {
  const { db, user, group, callbacks, classes, privilege } = props;
  const setTabbar = callbacks.setTabbar;
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  useEffect(()=>{
    setTabbar("settings.bank");
  }, [setTabbar]);

  return <div>
      <Typography>
        Bank Account
      </Typography>
      <Processing active={processing} />
      <ResultMessage error={error} />
  </div>
}

BankAccount.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(BankAccount);