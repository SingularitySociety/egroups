import * as test_helper from "./test_helper";

import * as firebase from "@firebase/testing";
import { should } from 'chai';

should()

const aliceUserId = "alice";
const bobUserId = "bob";
const charlieUserId = "charlie";

const anon_db = test_helper.authedDB(null);
const alice_db = test_helper.authedDB({ uid: aliceUserId });
const bob_db = test_helper.authedDB({ uid: bobUserId });
const charlie_db = test_helper.authedDB({ uid: charlieUserId });

test_helper.initHook();
const admin_db = test_helper.adminDB();

describe("My app", () => {
  it("require users to log in before creating and reading a profile", async () => {
    const profile = anon_db.doc(`users/${aliceUserId}`);
    await firebase.assertFails(profile.set({ birthday: "January 1" }));
    await firebase.assertFails(profile.get());
  });

  it("should only let users create their own profile", async () => {
    await firebase.assertSucceeds(
      alice_db.doc(`users/${aliceUserId}`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      alice_db.doc(`users/${bobUserId}`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
  });

  it("should only let users create their own public and anyone read public", async () => {
    await firebase.assertSucceeds(
      alice_db.doc(`users/${aliceUserId}/public/test`)
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      alice_db.doc(`users/${bobUserId}/public/test`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      bob_db.doc(`users/${aliceUserId}/public/test`)
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertSucceeds(
      bob_db.doc(`users/${bobUserId}/public/test`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    
    await firebase.assertSucceeds(
      alice_db.doc(`users/${aliceUserId}/public/test`).get()
    );
    await firebase.assertSucceeds(
      alice_db.doc(`users/${bobUserId}/public/test`).get()
    );
  });
  
  it("should only let users create/read their own private data", async () => {
    await firebase.assertSucceeds(
      alice_db.doc(`users/${aliceUserId}/private/test`)
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      alice_db.doc(`users/${bobUserId}/private/test`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      bob_db.doc(`users/${aliceUserId}/private/test`)
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertSucceeds(
      bob_db.doc(`users/${bobUserId}/private/test`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    
    await firebase.assertSucceeds(
      alice_db.doc(`users/${aliceUserId}/private/test`).get()
    );
    await firebase.assertFails(
      alice_db.doc(`users/${bobUserId}/private/test`).get()
    );
  });

  /*
  it("should only read user's phone data", async () => {
    // await firebase.assertSucceeds(
    // alice_db.doc(`users/${charlieUserId}`).get()
    // );

    // can't set phone when create;
    await firebase.assertFails(
      charlie_db.doc(`users/${charlieUserId}`).set({
        phone: "1234",
      })
    );

    // can create without phone
    await firebase.assertSucceeds(
      charlie_db.doc(`users/${charlieUserId}`).set({
        uid: charlieUserId,
      })
    );

    await firebase.assertSucceeds(
      charlie_db.doc(`users/${charlieUserId}`).get()
    );

    // can't update phone by user;
    await firebase.assertFails(
      charlie_db.doc(`users/${charlieUserId}`).set({
        phone: "1234",
      }, {merge: true})
    );

    await firebase.assertSucceeds(
      charlie_db.doc(`users/${charlieUserId}`).set({
        test: "1234",
      }, {merge: true})
    );

    // set phone by admin 
    await firebase.assertSucceeds (
      admin_db.doc(`users/${charlieUserId}`).set({
        phone: "1234",
      }, {merge: true})
    );

    // merge is ok because phone is not update
    await firebase.assertSucceeds(
      charlie_db.doc(`users/${charlieUserId}`).set({
        test: "1234",
      }, {merge: true})
    );

    // merge with phone failed because phone is not update
    await firebase.assertFails(
      charlie_db.doc(`users/${charlieUserId}`).set({
        phone: "aaabbb",
        test: "1234",
      }, {merge: true})
    );
    
    // same phone is ok
    await firebase.assertSucceeds(
      charlie_db.doc(`users/${charlieUserId}`).set({
        phone: "1234",
        test: "aaa"
      })
    );

    // different phone is not ok
    await firebase.assertFails(
      charlie_db.doc(`users/${charlieUserId}`).set({
        phone: "3333"
      })
    );
    
    // same phone is ok
    await firebase.assertSucceeds(
      charlie_db.doc(`users/${charlieUserId}`).set({
        phone: "1234",
        test: "aaa"
      })
    );

    const data = await charlie_db.doc(`users/${charlieUserId}`).get()
    data.data().should.deep.equal({ phone: '1234', test: 'aaa' });
    
  })
  */

});
