import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { withStyles } from '@material-ui/core/styles';
import { Typography, Button } from '@material-ui/core';
import ResultMessage from '../../common/ResultMessage';
import Processing from '../../common/Processing';
import useOnDocument from '../../common/useOnDocument';
import { FormattedMessage } from 'react-intl';
import * as firebase from "firebase/app";
import "firebase/functions";

const styles = theme => ({
});

function BankAccount(props) {
  const { db, user, group, callbacks, classes, privilege } = props;
  const setTabbar = callbacks.setTabbar;
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [account] = useOnDocument(db, `groups/${group.groupId}/private/account`);

  useEffect(()=>{
    setTabbar("settings.bank");
  }, [setTabbar]);

  useEffect(()=> {
    console.log(account);
  }, [account]);

  async function handleSubmit(e) {
    e.preventDefault();
    setProcessing(true);
    const context = {};
    const updateCustomAccount = firebase.functions().httpsCallable('updateCustomAccount');
    const result = (await updateCustomAccount(context)).data;
    console.log(result);
    setProcessing(false);
  }
 
  return <form>
      <div>
        <Button variant="contained" type="submit" onClick={handleSubmit}>
          <FormattedMessage id="submit" />
        </Button>
        <Processing active={processing} />
      </div>  
      <ResultMessage error={error} />
  </form>
}

BankAccount.propTypes = {
  classes: PropTypes.object.isRequired,
};
  
export default withStyles(styles)(BankAccount);