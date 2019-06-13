import React from 'react';
import { Route, BrowserRouter as Router } from 'react-router-dom';
import CssBaseline from '@material-ui/core/CssBaseline';
import MuiThemeProvider from '@material-ui/core/styles/MuiThemeProvider';
import theme from './theme';
import Home from './Home';
import Group from './group/Group';
import About from './About';
import Login from './Login';
import Decoder from './Decoder';
import * as firebase from "firebase/app";
import "firebase/firestore";
import "firebase/messaging"
import config from './config';
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
        this.setState({user: user});
        if (user) {
          const refUser = db.collection("users").doc(user.uid);
          const newValue = { lastAccessed:firebase.firestore.FieldValue.serverTimestamp() };
          const doc = (await refUser.get()).data();
          if (!doc || !doc.displayName) {
            newValue.displayName = user.displayName;
          }
          await refUser.set(newValue, { merge: true });
        }
      }
    );
    this.getPushToken();
    this.updateWindowDimensions();
    window.addEventListener('resize', this.updateWindowDimensions);
    
  }

  getPushToken() {
    if (config.messageKey) {
      const messaging = firebase.messaging();
      messaging.usePublicVapidKey(config.messageKey);

      // Request Permission of Notifications
      messaging.requestPermission().then(() => {
        console.log('Notification permission granted.');
        
        // Get Token
        messaging.getToken().then((token) => {
          console.log("client key is")
          console.log(token)
        })
      }).catch((err) => {
        console.log('Unable to get permission to notify.', err);
      });
      messaging.onMessage((payload) => {
        console.log(payload);
      });
    }
  }
  
  componentWillUnmount() {
    this.unregisterAuthObserver();
    window.removeEventListener('resize', this.updateWindowDimensions);
  }
  updateWindowDimensions() {
    this.setState({ width: window.innerWidth, height: window.innerHeight });
  }

  render() {
    const params = { user:this.state.user, db:db };
    //console.log("App:", window.location.pathname);
    const language = navigator.language.split(/[-_]/)[0];  // language without region code
    return (
      <IntlProvider locale={language} messages={messages[language]}>
        <MuiThemeProvider theme={theme}>
          <CssBaseline />
          <Router>
            <Route exact path="/" render={(props) => <Home {...props} {...params} />} />
            <Route path="/:groupName" render={(props) => <Group {...props} {...params} joinGroup={this.joinGroup} />} />
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
