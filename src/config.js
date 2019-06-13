import * as firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBQ91_ICyFGzcgQSGWaitKeCJlinpQnArI",
  authDomain: "fire-base-startup.firebaseapp.com",
  databaseURL: "https://fire-base-startup.firebaseio.com",
  projectId: "fire-base-startup",
  storageBucket: "fire-base-startup.appspot.com",
  messagingSenderId: "310551858437",
  appId: "1:310551858437:web:9166ca78a33b67c2"
};

export const appConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  ],
}

export default firebaseConfig;
