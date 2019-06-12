import * as test_helper from "./test_helper";

import * as firebase from "@firebase/testing";

const FieldValue = firebase.firestore.FieldValue

const aliceGroupId = "alice_group";
const aliceUID = "alice";

const bobUID = "bob";


describe("Group app", () => {
  it("should create group", async () => {

    const db = test_helper.authedDB({ uid: aliceUID });
    const admin_db = test_helper.adminDB();

    const alice_group = db.doc(`groups/${aliceGroupId}`);

    // anyone can create group
    await firebase.assertSucceeds(alice_group.set({
      created: FieldValue.serverTimestamp(),
      title: "alice group",
      secret: false,
      description: "hello",
      groupName: "hello",
      logo: "",
      banner: "",
    }));
    
    await admin_db.doc(`/groups/${aliceGroupId}/owners/${aliceUID}`).set({
      created: new Date()
    });

    await admin_db.doc(`/groups/${aliceGroupId}/privileges/${aliceUID}`).set({
      value: 0x2000000,
      created: new Date()
    });

    await firebase.assertSucceeds(alice_group.get());
    await firebase.assertSucceeds(alice_group.update({"aa": "bb"}));
  });

  it("should not create update group by bob", async () => {
    const bob_db = test_helper.authedDB({ uid: bobUID });
    const bob_alice_group = bob_db.doc(`groups/${aliceGroupId}`);

    // read ok
    await firebase.assertSucceeds(bob_alice_group.get());
    // update ng
    await firebase.assertFails(bob_alice_group.update({"bb": "dd"}));

  });

});
