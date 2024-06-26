"use strict";

var test_helper = _interopRequireWildcard(require("./test_helper"));

var firebase = _interopRequireWildcard(require("@firebase/testing"));

var _Privileges = _interopRequireDefault(require("../../src/const/Privileges"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) { var desc = Object.defineProperty && Object.getOwnPropertyDescriptor ? Object.getOwnPropertyDescriptor(obj, key) : {}; if (desc.get || desc.set) { Object.defineProperty(newObj, key, desc); } else { newObj[key] = obj[key]; } } } } newObj.default = obj; return newObj; } }

const FieldValue = firebase.firestore.FieldValue;
const aliceGroupId = "alice_group";
const aliceUID = "alice";
const bobUID = "bob";
const charlieUID = "charlie";
test_helper.initHook();
const admin_db = test_helper.adminDB();
const alice_db = test_helper.authedDB({
  uid: aliceUID,
  privileges: {
    alice_group: 33554432
  }
});
const bob_db = test_helper.authedDB({
  uid: bobUID,
  privileges: {
    alice_group: 1
  }
});
const charlie_db = test_helper.authedDB({
  uid: charlieUID
});
describe("Group app create and membership", () => {
  it("should create group", async () => {
    const alice_group = alice_db.doc(`groups/${aliceGroupId}`); // anyone can create group

    await firebase.assertSucceeds(test_helper.create_group(alice_group, aliceUID, aliceUID, true));
    await test_helper.add_group_privilege_for_admin(admin_db, aliceGroupId, aliceUID);
    await firebase.assertSucceeds(alice_group.get());
    await firebase.assertSucceeds(alice_group.update({
      "title": "hello",
      "privileges": 1
    }));
  });
  it("should not update group by bob", async () => {
    const bob_alice_group = bob_db.doc(`groups/${aliceGroupId}`); // read ok

    await firebase.assertSucceeds(bob_alice_group.get()); // update ng

    await firebase.assertFails(bob_alice_group.update({
      "bb": "dd"
    }));
  });
  it("should join open group", async () => {
    const alice_group = alice_db.doc(`groups/${aliceGroupId}`); // anyone can create group

    await firebase.assertSucceeds(test_helper.create_group(alice_group, aliceUID, aliceUID, true));
    await test_helper.add_group_privilege_for_admin(admin_db, aliceGroupId, aliceUID); // end of create group
    // add bob user as member

    await test_helper.add_group_privilege_for_member(admin_db, aliceGroupId, bobUID, bobUID, _Privileges.default.member); // admin case 
    // alice can see open group

    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/members/${aliceUID}`).get());
    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/members/${bobUID}`).get());
    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/members/${charlieUID}`).get()); // admin can read privileges

    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/privileges/${aliceUID}`).get());
    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/privileges/${bobUID}`).get());
    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/privileges/${charlieUID}`).get()); // anyone can't read onwer

    await firebase.assertFails(alice_db.doc(`/groups/${aliceGroupId}/owners/${aliceUID}`).get());
    await firebase.assertFails(alice_db.doc(`/groups/${aliceGroupId}/owners/${bobUID}`).get());
    await firebase.assertFails(alice_db.doc(`/groups/${aliceGroupId}/owners/${charlieUID}`).get()); // bob can see open group

    await firebase.assertSucceeds(bob_db.doc(`/groups/${aliceGroupId}/members/${bobUID}`).get()); // bob can't see other member

    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/members/${aliceUID}`).get());
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/members/${charlieUID}`).get()); // user can't read others privileges

    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/privileges/${aliceUID}`).get());
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/privileges/${charlieUID}`).get()); // user can read my privilege

    await firebase.assertSucceeds(bob_db.doc(`/groups/${aliceGroupId}/privileges/${bobUID}`).get()); // anyone can't read onwer

    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/owners/${aliceUID}`).get());
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/owners/${bobUID}`).get());
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/owners/${charlieUID}`).get()); // ## charlie anonymous
    // charlie can see open group

    await firebase.assertSucceeds(charlie_db.doc(`/groups/${aliceGroupId}/members/${charlieUID}`).get()); // charlie can't see other member

    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/members/${aliceUID}`).get());
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/members/${bobUID}`).get()); // user can read my privilege

    await firebase.assertSucceeds(charlie_db.doc(`/groups/${aliceGroupId}/privileges/${charlieUID}`).get()); // user can't read others privileges

    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/privileges/${aliceUID}`).get());
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/privileges/${bobUID}`).get()); // anyone can't read onwer

    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/owners/${aliceUID}`).get());
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/owners/${bobUID}`).get());
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/owners/${charlieUID}`).get());
  });
  it("should join closed group", async () => {
    const alice_group = alice_db.doc(`groups/${aliceGroupId}`); // anyone can create group

    await firebase.assertSucceeds(test_helper.create_group(alice_group, aliceUID, aliceUID, false));
    await test_helper.add_group_privilege_for_admin(admin_db, aliceGroupId, aliceUID); // end of create group
    // get test

    await firebase.assertSucceeds(alice_group.get()); // todo closed group
  });
});
describe("Open group channels test", async () => {
  it("should/should not create channel", async () => {
    // channels
    const alice_group = alice_db.doc(`groups/${aliceGroupId}`); // anyone can create group

    await firebase.assertSucceeds(test_helper.create_group(alice_group, aliceUID, aliceUID, true));
    await test_helper.add_group_privilege_for_admin(admin_db, aliceGroupId, aliceUID); // end of create group
    // alice is admin, bob is member, charlie is guest

    await test_helper.add_group_privilege_for_member(admin_db, aliceGroupId, bobUID, bobUID, _Privileges.default.member);
    await test_helper.add_group_privilege_for_member(admin_db, aliceGroupId, charlieUID, charlieUID, _Privileges.default.guest); // admin can create channel

    const title = "hello";
    await firebase.assertSucceeds(alice_db.collection(`groups/${aliceGroupId}/channels`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: aliceUID,
      read: _Privileges.default.member,
      write: _Privileges.default.member
    })); // member can create channel

    await firebase.assertSucceeds(bob_db.collection(`groups/${aliceGroupId}/channels`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: bobUID,
      read: _Privileges.default.member,
      write: _Privileges.default.member
    })); // guest can't create channel

    await firebase.assertFails(charlie_db.collection(`groups/${aliceGroupId}/channels`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: charlieUID,
      read: _Privileges.default.member,
      write: _Privileges.default.member
    }));
  });
});
describe("Open group article test", async () => {// article
});
describe("Open group events test", async () => {// events
});