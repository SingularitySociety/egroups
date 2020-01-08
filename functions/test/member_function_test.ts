import Privileges from '../react-lib/src/const/Privileges.js';
import * as test_helper from "../../lib/test/rules/test_helper";
import * as functions_test_helper from "./functions_test_helper";

import { should } from 'chai';

const {index, admin_db, test} = functions_test_helper.initFunctionsTest();

test_helper.initHook()

should()

describe('Member function test', () => {
  it ('update test', async function() {
    const groupId = "member_test";
    const userId = "user1";

    const refMember = admin_db.doc(`groups/${groupId}/members/${userId}`);
    await refMember.set({name: "hello"})
    const snap = test.database.makeDataSnapshot({}, `groups/${groupId}/members/${userId}`);

    // not subscriber member
    const wrapped = test.wrap(index.memberDidCreate);
    await wrapped(snap, {params: {groupId, userId}});

    const data1 = (await refMember.get()).data();
    data1.name.should.equal('hello');
    data1.privilege.should.equal(1);

    const historyDoc = (await admin_db.doc(`/groups/${groupId}/members/${userId}/private/history`).get());
    historyDoc.exists.should.equal(true);

    // subscriber member
    // create subscription
    await admin_db.doc(`/groups/${groupId}/members/${userId}/secret/stripe`).set({subscription: {}})

    await wrapped(snap, {params: {groupId, userId}});
    
    const data2 = (await admin_db.doc(`/privileges/${userId}`).get()).data();
    data2[groupId].should.equal(Privileges.subscriber);

    const data3 = (await refMember.get()).data();
    data3.name.should.equal('hello');
    data3.privilege.should.equal(256);
    
  });
});
