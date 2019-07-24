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
  const groupId = group.groupId;
  const setTabbar = callbacks.setTabbar;
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [account] = useOnDocument(db, `groups/${groupId}/private/account`);
  const [account_data, setAccountData] = useState({});
  const [business_type, setBusinessType] = useState(null);

  useEffect(()=>{
    setTabbar("settings.bank");
  }, [setTabbar]);

  useEffect(()=> {
    if (account && account.account) {
      console.log(account.account);
      setBusinessType(account.account.business_type);
      if (account.account.business_type === "company") {
        console.log("company");
        setAccountData(account.account.company || {});
      } else if (account.account.business_type === "individual") {
        console.log("individual");
        setAccountData(account.account.individual || {});
      }
    }
  }, [account]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setProcessing(true);
    console.log(account_data);
    const context = { groupId, business_type, 
        account_data:{
          name:null,
        }
      };
      console.log(context);
      const updateCustomAccount = firebase.functions().httpsCallable('updateCustomAccount');
    const result = (await updateCustomAccount(context)).data;
    console.log(result);
    if (!result.result) {
      console.log("error", result.error.message);
      setError(result.error.message);
    }
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