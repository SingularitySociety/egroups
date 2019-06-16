import * as firebase from "firebase/app";
import "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyD-i5bqwVjvmqWeaDIgBbkzH5b79PF3kUE",
  authDomain: "e-group-test.firebaseapp.com",
  databaseURL: "https://e-group-test.firebaseio.com",
  projectId: "e-group-test",
  storageBucket: "e-group-test.appspot.com",
  messagingSenderId: "198486292334",
  appId: "1:198486292334:web:c8a7e6371b3c6b86",
  messageKey: "BJjXvPfvKS28CdLu4vbnXoajer-DiBlbJLTNsarbXpm9A_ha1HLqnMhXbJB8eR5cSEnXsfpesk0Z9uzlo_DIoV4",
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
