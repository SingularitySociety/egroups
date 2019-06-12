import * as firebase from "@firebase/testing";
import Privileges from '../../src/const/Privileges';
import fs from "fs";


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

export const add_group_privilege_for_admin = async (admin_db, groupId, UID) => {
  await admin_db.doc(`/groups/${groupId}/owners/${UID}`).set({
    created: new Date()
  });
  await admin_db.doc(`/groups/${groupId}/members/${UID}`).set({
    created: new Date(),
    displayName: UID,
  });
  await admin_db.doc(`/groups/${groupId}/privileges/${UID}`).set({
    value: 0x2000000,
    created: new Date()
  });
}

export const add_group_privilege_for_member = async (admin_db, groupId, UID, name, privileges) => {
  await admin_db.doc(`/groups/${groupId}/members/${UID}`).set({
    created: new Date(),
    displayName: name,
  });
  await admin_db.doc(`/groups/${groupId}/privileges/${UID}`).set({
    value: privileges,
    created: new Date()
  });
}

export const create_group = (group, name, title, open) => {
  return group.set({
    groupName: name,
    title,
    privileges: {
      channel: { read:Privileges.member, write:Privileges.member, create:Privileges.member },
      article: { read:Privileges.member, write:Privileges.member, comment:Privileges.member },
      event: { read:Privileges.member, write:Privileges.member, attend:Privileges.member },
      membership: { open: true },
    },
    created: new Date(),
  });
}