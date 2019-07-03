import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import theme from './theme';
import Home from './Home';
import GroupRouter from './group/GroupRouter';
import About from './About';
import Login from './Login';
import Decoder from './Decoder';
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/messaging";
import "firebase/functions";
import config from './config';
import { appConfig } from './config';
import {addLocaleData, IntlProvider} from 'react-intl';
import en from 'react-intl/locale-data/en';
import ja from 'react-intl/locale-data/ja';
import message_en from './locale/en.json';
import message_ja from './locale/ja.json';
import NewGroup from './NewGroup';

addLocaleData([...en, ...ja]);
const messages = {
  en: message_en,
  ja: message_ja
};

firebase.initializeApp(config);
const db = firebase.firestore();

class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = { user:null, width:0, height:0 };
    this.updateWindowDimensions = this.updateWindowDimensions.bind(this);
  }
  componentDidMount() {
    this.unregisterAuthObserver = firebase.auth().onAuthStateChanged(
      async (user) => {
        if (this.detachPrivilegesObserver) {
          this.detachPrivilegesObserver();
          this.detachPrivilegesObserver = null;
        }
        this.setState({user: user});
        if (user) {
          this.detachPrivilegesObserver = db.doc(`privileges/${user.uid}`).onSnapshot(async (snapshot) => {
            const getJWT = firebase.functions().httpsCallable('getJWT');
            const token = (await getJWT()).data; 
            //console.log("token", token);
            console.log("privileges", token.privileges);
            this.setState({privileges: token.privileges});
            try {
              await firebase.auth().signInWithCustomToken(token.token);
            } catch(e) {
              console.log(e);
            }
          });

          const refUser = db.collection("users").doc(user.uid);
          const newValue = { lastAccessed:firebase.firestore.FieldValue.serverTimestamp() };
          const doc = (await refUser.get()).data();
          if (!doc || !doc.displayName) {
            newValue.displayName = user.displayName;
          }
          await refUser.set(newValue, { merge: true });
          this.getPushToken(user);
        }
      }
    );
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    
  }
  // messaging
  async getExistTokens(uid) {
    const tokens = await db.doc(`users/${uid}/private/tokens`).get();
    return tokens.exists ? tokens.data().tokens : [];
  }
  async updatePushToken(uid, newToken, oldToken=null) {
    let exist_tokens = await this.getExistTokens(uid);
    if (!exist_tokens.includes(newToken)) {
      exist_tokens.push(newToken)
    }
    if (oldToken && exist_tokens.includes(oldToken)) {
      exist_tokens = exist_tokens.filter((elem) => elem !== oldToken);
    }
    await this.updateToken(uid, exist_tokens);
    console.log("exist_token:", exist_tokens)
  }
  async updateToken(uid, tokens) {
    db.doc(`users/${uid}/private/tokens`).set({tokens: tokens});
  }
  getPushToken(user) {
    if (config.messageKey && firebase.messaging.isSupported()) {
      const messaging = firebase.messaging();
      messaging.usePublicVapidKey(config.messageKey);

      const exist_token = localStorage.getItem("pushToken");
      messaging.requestPermission().then(async () => {
        if (exist_token) {
          console.log("exist_token")
          const self = this;
          messaging.getToken().then(function(refreshedToken) {
            self.updatePushToken(user.uid, refreshedToken, localStorage.getItem("pushToken"));
            localStorage.setItem("pushToken", refreshedToken);
          });
          /*
          const exist_tokens = await this.getExistTokens(user.uid);
          if (!exist_tokens.includes(exist_token)) {
            console.log("exist_token: but not on");
            exist_tokens.push(exist_token);
            this.updateToken(user.uid, exist_tokens);
          }
          */
          // watch refresh
          messaging.onTokenRefresh(function() {

            messaging.getToken().then(function(refreshedToken) {
              console.log("refresh token");
              self.updatePushToken(user.uid, refreshedToken, localStorage.getItem("pushToken"));
              localStorage.setItem("pushToken", refreshedToken);
            });
          });
          // update force
          // firebase.functions().httpsCallable('updateTopicSubscription');
        } else {
          // new token
          console.log("new_token")
          messaging.getToken().then((token) => {
            this.updatePushToken(user.uid, token);
          })
        }
      }).catch((err) => {
        console.log('Unable to get permission to notify.', err);
      });
      messaging.onMessage((payload) => {
        // todo implement if push message receive
        console.log(payload);
      });
    }
  }

  componentWillUnmount() {
    if (this.detachPrivilegesObserver) {
      this.detachPrivilegesObserver();
    }
    this.unregisterAuthObserver();
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    const { user, privileges } = this.state;
    const params = { user, db, privileges, rootGroup:appConfig.rootGroup };
    //console.log("App:", window.location.pathname);
    const language = navigator.language.split(/[-_]/)[0];  // language without region code
    return (
      <IntlProvider locale={language} messages={messages[language]}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            {
              appConfig.rootGroup ?
              <Route exact path="/" render={(props) => <GroupRouter {...props} {...params} joinGroup={this.joinGroup} />} />
              : <Route exact path="/" render={(props) => <Home {...props} {...params} />} />
            }
            <Route path="/:gp" render={(props) => <GroupRouter {...props} {...params} joinGroup={this.joinGroup} />} />
            <Route exact path="/a/about" render={(props) => <About {...props} {...params} />} />
            <Route exact path="/a/new/:groupId" render={(props) => <NewGroup {...props} {...params} />} />
            <Route exact path="/a/login" render={(props) => <Login {...props} {...params} />} />
            <Route exact path="/a/login/cmd/:encoded" render={(props) => <Login {...props} {...params} />} />
            <Route exact path="/a/login/target/:target" render={(props) => <Login {...props} {...params} />} />
            { // We need to mount the Decoder component only after the user info became available.
              (this.state.user) ?
                <Route exact path="/a/decode/:encoded" render={(props) => <Decoder {...props} {...params} />} />
                : "" 
            }
          </Router>
        </MuiThemeProvider>
      </IntlProvider>
    );
  }
}

export default App;
