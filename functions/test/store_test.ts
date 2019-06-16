import * as test_helper from "../../lib/test/rules/test_helper";
import * as firebase from "@firebase/testing";
import { should } from 'chai';

import * as messaging from '../src/messaging';

should()

const admin_db = test_helper.adminDB();

const aliceGroupId = "alice_group";
const aliceUID = "alice";

describe("test topic subscription", () => {
  it("should subscribe topic", async () => {
    const alice_group = admin_db.doc(`groups/${aliceGroupId}`);
    await firebase.assertSucceeds(test_helper.create_group(alice_group, aliceUID, aliceUID, true));

    await admin_db.doc(`groups/1/members/${aliceUID}`).set({
      uid: aliceUID,
      groupId: "1",
    });
    await admin_db.doc(`groups/2/members/${aliceUID}`).set({
      uid: aliceUID,
      groupId: "2",
    });
    await admin_db.doc(`groups/3/members/${aliceUID}`).set({
      uid: aliceUID,
      groupId: "3",
    });
    await admin_db.doc(`groups/4/members/${aliceUID}`).set({
      uid: aliceUID,
      groupId: "4",
    });

    const topic_ids = ["g_1", "g_2", "g_3", "g_4"];
    await messaging.subscribe_group([123], [], "1", admin_db, (tokens, topic) => {
      tokens.should.members([123]);
      topic.should.equal(topic_ids.shift());
    });
  })
})
    
