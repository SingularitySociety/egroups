import * as firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDjiYcArEzy5_0kc1Bq6uo0pHKrDYpBWKY",
  authDomain: "e-groups.firebaseapp.com",
  databaseURL: "https://e-groups.firebaseio.com",
  projectId: "e-groups",
  storageBucket: "e-groups.appspot.com",
  messagingSenderId: "866990675127",
  appId: "1:866990675127:web:821b9610148c3b2b",
  messageKey: "BCrvhfMDgC5kuQaNsD1pL1uB_s-LdPsxilBoknX-Vs4u8ULzYCbOw9LBjo9jSLWnK6xgzvhZKFMFz8ymkujEn4I",
};

export const appConfig = {
  signInOptions: [
    firebase.auth.EmailAuthProvider.PROVIDER_ID,
    firebase.auth.FacebookAuthProvider.PROVIDER_ID,
    //firebase.auth.TwitterAuthProvider.PROVIDER_ID,
  ],
}

export default firebaseConfig;
