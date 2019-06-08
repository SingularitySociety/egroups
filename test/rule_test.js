const firebase = require("@firebase/testing");
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
function authedApp(auth) {
  return firebase
    .initializeTestApp({ projectId, auth })
    .firestore();
}

/*
 * ============
 *  Test Cases
 * ============
 */
beforeEach(async () => {
  // Clear the database between tests
  await firebase.clearFirestoreData({ projectId });
});

before(async () => {
  await firebase.loadFirestoreRules({ projectId, rules });
});

after(async () => {
  await Promise.all(firebase.apps().map(app => app.delete()));
  console.log(`View rule coverage information at ${coverageUrl}\n`);
});

describe("My app", () => {
  it("require users to log in before creating and reading a profile", async () => {
    const db = authedApp(null);
    const profile = db.doc("users/alice");
    await firebase.assertFails(profile.set({ birthday: "January 1" }));
    await firebase.assertFails(profile.get());
  });

  it("should only let users create their own profile", async () => {
    const db = authedApp({ uid: "alice" });
    await firebase.assertSucceeds(
      db.doc("users/alice")
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      db.doc("users/bob")
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
  });

  it("should only let users create their own public and anyone read public", async () => {
    const alice_db = authedApp({ uid: "alice" });
    const bob_db = authedApp({ uid: "bob" });
    await firebase.assertSucceeds(
      alice_db.doc("users/alice/public/test")
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      alice_db.doc("users/bob/public/test")
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      bob_db.doc("users/alice/public/test")
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertSucceeds(
      bob_db.doc("users/bob/public/test")
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    
    await firebase.assertSucceeds(
      alice_db.doc("users/alice/public/test").get()
    );
    await firebase.assertSucceeds(
      alice_db.doc("users/bob/public/test").get()
    );
  });
  
  it("should only let users create/read their own private data", async () => {
    const alice_db = authedApp({ uid: "alice" });
    const bob_db = authedApp({ uid: "bob" });
    await firebase.assertSucceeds(
      alice_db.doc("users/alice/private/test")
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      alice_db.doc("users/bob/private/test")
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertFails(
      bob_db.doc("users/alice/private/test")
        .set({
          profile: "I am a pen",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    await firebase.assertSucceeds(
      bob_db.doc("users/bob/private/test")
        .set({
          birthday: "January 1",
          createdAt: firebase.firestore.FieldValue.serverTimestamp()
        })
    );
    
    await firebase.assertSucceeds(
      alice_db.doc("users/alice/private/test").get()
    );
    await firebase.assertFails(
      alice_db.doc("users/bob/private/test").get()
    );
  });
  

  /*
  it("should enforce the createdAt date in user profiles", async () => {
    const db = authedApp({ uid: "alice" });
    const profile = db.collection("users").doc("alice");
    await firebase.assertFails(profile.set({ birthday: "January 1" }));
    await firebase.assertSucceeds(
      profile.set({
        birthday: "January 1",
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
      })
    );
  });

  it("should let anyone read any profile", async () => {
    const db = authedApp(null);
    const profile = db.collection("users").doc("alice");
    await firebase.assertSucceeds(profile.get());
  });

  it("should let anyone create a room", async () => {
    const db = authedApp({ uid: "alice" });
    const room = db.collection("rooms").doc("firebase");
    await firebase.assertSucceeds(
      room.set({
        owner: "alice",
        topic: "All Things Firebase"
      })
    );
  });

  it("should force people to name themselves as room owner when creating a room", async () => {
    const db = authedApp({ uid: "alice" });
    const room = db.collection("rooms").doc("firebase");
    await firebase.assertFails(
      room.set({
        owner: "scott",
        topic: "Firebase Rocks!"
      })
    );
  });

  it("should not let one user steal a room from another user", async () => {
    const alice = authedApp({ uid: "alice" });
    const bob = authedApp({ uid: "bob" });

    await firebase.assertSucceeds(
      bob
        .collection("rooms")
        .doc("snow")
        .set({
          owner: "bob",
          topic: "All Things Snowboarding"
        })
    );

    await firebase.assertFails(
      alice
        .collection("rooms")
        .doc("snow")
        .set({
          owner: "alice",
          topic: "skiing > snowboarding"
        })
    );
  });
*/
});
