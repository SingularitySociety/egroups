import * as firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD9rfaaHl9lGb4HbTwItsBsczLobQligEw",
  authDomain: "e-group-jp.firebaseapp.com",
  databaseURL: "https://e-group-jp.firebaseio.com",
  projectId: "e-group-jp",
  storageBucket: "e-group-jp.appspot.com",
  messagingSenderId: "703654481766",
  appId: "1:703654481766:web:3ef561dce0de363f",
  messageKey: "BKW71gXeSoznuvLPy7A1taqkAY4QAa6xDF94GWlE7rmXI7q1tFKVbHKzhHO87O8F9_NSQ9XdmwDv-jm5-gZnmGo",
};

export const appConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    firebase.auth.GithubAuthProvider.PROVIDER_ID,
    //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  ],
  //rootGroup: "betatest",
}

export default firebaseConfig;
