"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.create_group = exports.add_group_privilege_for_member = exports.add_group_privilege_for_admin = exports.initHook = exports.setRule = exports.clearData = exports.adminDB = exports.authedDB = void 0;

var firebase = _interopRequireWildcard(require("@firebase/testing"));

var _Privileges = _interopRequireDefault(require("../../src/const/Privileges"));

var _fs = _interopRequireDefault(require("fs"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

/*
 * ============
 *    Setup
 * ============
 */
const projectId = "firestore-emulator-egroups";
const coverageUrl = `http://localhost:8080/emulator/v1/projects/${projectId}:ruleCoverage.html`;

const rules = _fs.default.readFileSync("firestore.rules", "utf8");

const authedDB = auth => {
  return firebase.initializeTestApp({
    projectId,
    auth
  }).firestore();
};

exports.authedDB = authedDB;

const adminDB = () => {
  return firebase.initializeAdminApp({
    projectId: projectId
  }).firestore();
};

exports.adminDB = adminDB;

const clearData = async () => {
  await firebase.clearFirestoreData({
    projectId
  });
};

exports.clearData = clearData;

const setRule = async () => {
  await firebase.loadFirestoreRules({
    projectId,
    rules
  });
};

exports.setRule = setRule;

const initHook = () => {
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
};

exports.initHook = initHook;

const add_group_privilege_for_admin = async (admin_db, groupId, UID) => {
  await admin_db.doc(`/groups/${groupId}/owners/${UID}`).set({
    created: new Date()
  });
  await admin_db.doc(`/groups/${groupId}/members/${UID}`).set({
    created: new Date(),
    displayName: UID
  });
  await admin_db.doc(`/groups/${groupId}/privileges/${UID}`).set({
    value: 0x2000000,
    created: new Date()
  });
};

exports.add_group_privilege_for_admin = add_group_privilege_for_admin;

const add_group_privilege_for_member = async (admin_db, groupId, UID, name, privileges) => {
  await admin_db.doc(`/groups/${groupId}/members/${UID}`).set({
    created: new Date(),
    displayName: name
  });
  await admin_db.doc(`/groups/${groupId}/privileges/${UID}`).set({
    value: privileges,
    created: new Date()
  });
};

exports.add_group_privilege_for_member = add_group_privilege_for_member;

const create_group = (group, name, title, open) => {
  return group.set({
    groupName: name,
    title,
    privileges: {
      channel: {
        read: _Privileges.default.member,
        write: _Privileges.default.member,
        create: _Privileges.default.member
      },
      article: {
        read: _Privileges.default.member,
        write: _Privileges.default.member,
        comment: _Privileges.default.member
      },
      event: {
        read: _Privileges.default.member,
        write: _Privileges.default.member,
        attend: _Privileges.default.member
      },
      membership: {
        open: true
      }
    },
    created: new Date()
  });
};

exports.create_group = create_group;