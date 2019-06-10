import * as test_helper from "./test_helper";

import * as firebase from "@firebase/testing";

/*
 * ============
 *  Test Cases
 * ============
 */
beforeEach(async () => {
  // Clear the database between tests
  await test_helper.clearData();
});

before(async () => {
  await test_helper.setRule();
});


const FieldValue = firebase.firestore.FieldValue

describe("Group app", () => {
  it("should create group", async () => {
    const db = test_helper.authedApp({ uid: "alice" });
    const alice_group = db.doc("groups/alice_group");
    const alice_group_priv = db.doc("groups/alice_group/privileges/alice_group");

    const bob_db = test_helper.authedApp({ uid: "bob" });
    const bob_alice_group = bob_db.doc("groups/alice_group");
    const bob_alice_group_priv = bob_db.doc("groups/alice_group/privileges/bob");
    
    await firebase.assertSucceeds(alice_group.set({
      created: FieldValue.serverTimestamp(),
      uid: "alice",
      title: "alice group",
      secret: false,
      description: "hello",
      groupName: "hello",
      logo: "",
      banner: "",
    }));
    await firebase.assertSucceeds(alice_group_priv.set({
      created: FieldValue.serverTimestamp(),
      value: 5,
    }));

    await firebase.assertFails(bob_alice_group_priv.set({
      created: FieldValue.serverTimestamp(),
      value: 5,
    }));
    
    await firebase.assertSucceeds(alice_group.get());
    await firebase.assertSucceeds(alice_group.update({"aa": "bb"}));

    await firebase.assertSucceeds(bob_alice_group.get());
    await firebase.assertFails(bob_alice_group.update({"bb": "dd"}));

  });

});
