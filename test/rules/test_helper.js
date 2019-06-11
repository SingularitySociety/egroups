import * as firebase from "@firebase/testing";

const fs = require("fs");

/*
 * ============
 *    Setup
 * ============
 */
const projectId = "firestore-emulator-egroups";
const coverageUrl = `http://localhost:8080/emulator/v1/projects/${projectId}:ruleCoverage.html`;

const rules = fs.readFileSync("firestore.rules", "utf8");


export const authedDB = (auth) => {
  return firebase
    .initializeTestApp({ projectId, auth })
    .firestore();
}

export const adminDB = () => {
  return  firebase.initializeAdminApp({
    projectId: projectId
  }).firestore();
}

export const clearData = async() => {
  await firebase.clearFirestoreData({ projectId });
}

export const setRule = async() => {
  await firebase.loadFirestoreRules({ projectId, rules });
}

beforeEach(async () => {
  // Clear the database between tests
  await clearData();
});

before(async () => {
  await setRule();
});

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
  console.log(`View rule coverage information at ${coverageUrl}\n`);
});

