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


/**
 * Creates a new app with authentication data matching the input.
 *
 * @param {object} auth the object to use for authentication (typically {uid: some-uid})
 * @return {object} the app.
 */
export const authedApp = (auth) => {
  return firebase
    .initializeTestApp({ projectId, auth })
    .firestore();
}

export const clearData = async() => {
  await firebase.clearFirestoreData({ projectId });
}

export const setRule = async() => {
  await firebase.loadFirestoreRules({ projectId, rules });
}

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
  console.log(`View rule coverage information at ${coverageUrl}\n`);
});
