import * as test_helper from "./test_helper";
import * as firebase from "@firebase/testing";
import Privileges from '../../src/const/Privileges';

const FieldValue = firebase.firestore.FieldValue

const aliceGroupId = "alice_group";
const aliceUID = "alice";

const bobUID = "bob";
const charlieUID = "charlie";

const admin_db = test_helper.adminDB();

const alice_db = test_helper.authedDB({ uid: aliceUID });
const bob_db = test_helper.authedDB({ uid: bobUID });
const charlie_db = test_helper.authedDB({ uid: charlieUID });

describe("Group app create and membership", () => {
  it("should create group", async () => {

    const alice_group = alice_db.doc(`groups/${aliceGroupId}`);

    // anyone can create group
    await firebase.assertSucceeds(test_helper.create_group(alice_group, aliceUID, aliceUID, true));
    await test_helper.add_group_privilege_for_admin(admin_db, aliceGroupId, aliceUID);

    await firebase.assertSucceeds(alice_group.get());
    await firebase.assertSucceeds(alice_group.update({"aa": "bb"}));
  });

  it("should not update group by bob", async () => {
    const bob_alice_group = bob_db.doc(`groups/${aliceGroupId}`);

    // read ok
    await firebase.assertSucceeds(bob_alice_group.get());
    // update ng
    await firebase.assertFails(bob_alice_group.update({"bb": "dd"}));

  });

  it("should join open group", async () => {

    const alice_group = alice_db.doc(`groups/${aliceGroupId}`);
    
    // anyone can create group
    await firebase.assertSucceeds(test_helper.create_group(alice_group, aliceUID, aliceUID, true))
    await test_helper.add_group_privilege_for_admin(admin_db, aliceGroupId, aliceUID);
    // end of create group

    // add bob user as member
    await test_helper.add_group_privilege_for_member(admin_db, aliceGroupId, bobUID, bobUID, Privileges.member);
    
    
    // admin case 
    
    // alice can see open group
    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/members/${aliceUID}`).get())
    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/members/${bobUID}`).get())
    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/members/${charlieUID}`).get())

    // admin can read privileges
    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/privileges/${aliceUID}`).get())
    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/privileges/${bobUID}`).get())
    await firebase.assertSucceeds(alice_db.doc(`/groups/${aliceGroupId}/privileges/${charlieUID}`).get())

    // anyone can't read onwer
    await firebase.assertFails(alice_db.doc(`/groups/${aliceGroupId}/owners/${aliceUID}`).get())
    await firebase.assertFails(alice_db.doc(`/groups/${aliceGroupId}/owners/${bobUID}`).get())
    await firebase.assertFails(alice_db.doc(`/groups/${aliceGroupId}/owners/${charlieUID}`).get())

    
    // bob can see open group
    await firebase.assertSucceeds(bob_db.doc(`/groups/${aliceGroupId}/members/${bobUID}`).get())

    // bob can't see other member
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/members/${aliceUID}`).get())
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/members/${charlieUID}`).get())

    // user can't read others privileges
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/privileges/${aliceUID}`).get())
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/privileges/${charlieUID}`).get())
    // user can read my privilege
    await firebase.assertSucceeds(bob_db.doc(`/groups/${aliceGroupId}/privileges/${bobUID}`).get())

    // anyone can't read onwer
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/owners/${aliceUID}`).get())
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/owners/${bobUID}`).get())
    await firebase.assertFails(bob_db.doc(`/groups/${aliceGroupId}/owners/${charlieUID}`).get())

    // ## charlie anonymous
    
    // charlie can see open group
    await firebase.assertSucceeds(charlie_db.doc(`/groups/${aliceGroupId}/members/${charlieUID}`).get())

    // charlie can't see other member
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/members/${aliceUID}`).get())
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/members/${bobUID}`).get())

    // user can read my privilege
    await firebase.assertSucceeds(charlie_db.doc(`/groups/${aliceGroupId}/privileges/${charlieUID}`).get())
    // user can't read others privileges
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/privileges/${aliceUID}`).get())
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/privileges/${bobUID}`).get())

    // anyone can't read onwer
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/owners/${aliceUID}`).get())
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/owners/${bobUID}`).get())
    await firebase.assertFails(charlie_db.doc(`/groups/${aliceGroupId}/owners/${charlieUID}`).get())

  });

  it("should join closed group", async () => {
    const alice_group = alice_db.doc(`groups/${aliceGroupId}`);
    
    // anyone can create group
    await firebase.assertSucceeds(test_helper.create_group(alice_group, aliceUID, aliceUID, false))
    await test_helper.add_group_privilege_for_admin(admin_db, aliceGroupId, aliceUID);
    // end of create group

    // get test
    await firebase.assertSucceeds(alice_group.get());
    
    // todo closed group
  });
});


describe("Open group channels test", async () => {
  it("should/should not create channel", async () => {
    // channels
    const alice_group = alice_db.doc(`groups/${aliceGroupId}`);
    
    // anyone can create group
    await firebase.assertSucceeds(test_helper.create_group(alice_group, aliceUID, aliceUID, true))
    await test_helper.add_group_privilege_for_admin(admin_db, aliceGroupId, aliceUID);
    // end of create group
    
    // alice is admin, bob is member, charlie is guest
    await test_helper.add_group_privilege_for_member(admin_db, aliceGroupId, bobUID, bobUID, Privileges.member);
    await test_helper.add_group_privilege_for_member(admin_db, aliceGroupId, charlieUID, charlieUID, Privileges.guest);
    
    // admin can create channel
    const title = "hello";
    await firebase.assertSucceeds(alice_db.collection(`groups/${aliceGroupId}/channels`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: aliceUID,
      read: Privileges.member, 
      write: Privileges.member, 
    }));
    
    // member can create channel
    await firebase.assertSucceeds(bob_db.collection(`groups/${aliceGroupId}/channels`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: bobUID,
      read: Privileges.member, 
      write: Privileges.member, 
    }));

    // guest can't create channel
    await firebase.assertFails(charlie_db.collection(`groups/${aliceGroupId}/channels`).add({
      title,
      created: firebase.firestore.FieldValue.serverTimestamp(),
      owner: charlieUID,
      read: Privileges.member, 
      write: Privileges.member, 
    }));
  });
});
describe("Open group article test", async () => {
  // article
});
describe("Open group events test", async () => {
  // events
});