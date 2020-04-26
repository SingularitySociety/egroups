import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import { Typography } from '@material-ui/core';
import { FormattedMessage } from 'react-intl';
import { injectIntl } from 'react-intl';

import StyledFirebaseAuth from 'react-firebaseui/StyledFirebaseAuth';
import * as firebase from "firebase/app";
import "firebase/auth";
import { appConfig } from '../../config';

const styles = theme => ({
  about: {
  },
  terms: {
    width: "100%",
    '& > iframe': {
      width: "100%",
    },
  },
});
const useStyles = makeStyles(styles);

const uiConfig = {
    // Popup signin flow rather than redirect flow.
    signInFlow: 'popup',
    // We will display Google and Facebook as auth providers.
    signInOptions: appConfig.signInOptions,
    callbacks: {
      // Avoid redirects after sign-in.
      signInSuccessWithAuthResult: (result) => {
        const { additionalUserInfo, credential } = result;
        if (additionalUserInfo && credential 
          && credential.providerId === firebase.auth.TwitterAuthProvider.PROVIDER_ID) {
            console.log("Twitter user name=", additionalUserInfo.username);
        }
        return false;
      }
    }
};

function PleaseLogin(props) { 
  const { intl } = props;

  const classes = useStyles();
  const terms_file = "/" + (intl.formatMessage({id: "terms_and_conditions.file_name"}) || "terms_en.html");
  const agreeTermElement = <div className={classes.terms}>
                             <iframe src={terms_file} title="term" /><br/>
                           </div>;
  return (
      <Typography className={classes.about}>
        <FormattedMessage id="login.please" />

        <StyledFirebaseAuth uiConfig={uiConfig} firebaseAuth={firebase.auth()}/>
        {agreeTermElement}
      </Typography>
  );
}

PleaseLogin.propTypes = {
  ///classes: PropTypes.object.isRequired,
};
  
export default injectIntl(PleaseLogin);
