import * as test_helper from "./test_helper";

import * as firebase from "@firebase/testing";

const aliceUID = "alice";
const bobUID = "bob";

const anon_db = test_helper.authedDB(null);
const alice_db = test_helper.authedDB({ uid: aliceUID });
const bob_db = test_helper.authedDB({ uid: bobUID });

test_helper.initHook();

describe("My app", () => {
  it("require users to log in before creating and reading a profile", async () => {
    const profile = anon_db.doc(`users/${aliceUID}`);
    await firebase.assertFails(profile.set({ birthday: "January 1" }));
    await firebase.assertFails(profile.get());
  });

  it("should only let users create their own profile", async () => {
    await firebase.assertSucceeds(
      alice_db.doc(`users/${aliceUID}`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      alice_db.doc(`users/${bobUID}`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
  });

  it("should only let users create their own public and anyone read public", async () => {
    await firebase.assertSucceeds(
      alice_db.doc(`users/${aliceUID}/public/test`)
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      alice_db.doc(`users/${bobUID}/public/test`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      bob_db.doc(`users/${aliceUID}/public/test`)
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertSucceeds(
      bob_db.doc(`users/${bobUID}/public/test`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    
    await firebase.assertSucceeds(
      alice_db.doc(`users/${aliceUID}/public/test`).get()
    );
    await firebase.assertSucceeds(
      alice_db.doc(`users/${bobUID}/public/test`).get()
    );
  });
  
  it("should only let users create/read their own private data", async () => {
    await firebase.assertSucceeds(
      alice_db.doc(`users/${aliceUID}/private/test`)
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      alice_db.doc(`users/${bobUID}/private/test`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      bob_db.doc(`users/${aliceUID}/private/test`)
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertSucceeds(
      bob_db.doc(`users/${bobUID}/private/test`)
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    
    await firebase.assertSucceeds(
      alice_db.doc(`users/${aliceUID}/private/test`).get()
    );
    await firebase.assertFails(
      alice_db.doc(`users/${bobUID}/private/test`).get()
    );
  });
  
});
