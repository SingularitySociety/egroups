import * as firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDTv5SxYnTIxcbw6KcGb8FcSOVFHggGMTg",
  authDomain: "e-groups-staging.firebaseapp.com",
  databaseURL: "https://e-groups-staging.firebaseio.com",
  projectId: "e-groups-staging",
  storageBucket: "e-groups-staging.appspot.com",
  messagingSenderId: "124020799661",
  appId: "1:124020799661:web:5d39dc69ebc8dbbf"
};

export const appConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    //firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    //firebase.auth.GithubAuthProvider.PROVIDER_ID,
    //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  ],
  //rootGroup: "betatest",
}

export default firebaseConfig;
