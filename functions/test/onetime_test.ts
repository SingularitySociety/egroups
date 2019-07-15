import * as functions_test_helper from "./functions_test_helper";
// import * as test_helper from "../../lib/test/rules/test_helper";

import { should } from 'chai';
import * as UUID from "uuid-v4";

const {index, admin_db, test} = functions_test_helper.initFunctionsTest();

should()

describe('Onetime SMS function', () => {
  it ('Onetime SMS test', async function() {
    // this.timeout(10000);
    const uuid = UUID();
    const aliceUserId = "test_phone_" + uuid;

    // run test
    const req = {phone: "+81-90-8712-3456"};
    const context = {auth: {uid: aliceUserId}};
    const wrapped = test.wrap(index.requestOnetimeSMS);

    const response = await wrapped(req, context);
    
    const res = await admin_db.doc(`/users/${aliceUserId}/secret/onetime`).get();
    const resdata = res.data();

    response.result.should.equal(true)
    response.phone.should.equal(resdata.smscode.phone)
    response.ttl.should.equal(resdata.smscode.ttl)

    // run test
    const req2 = {};
    const wrapped2 = test.wrap(index.confirmOnetimeSMS);

    const response2 = await wrapped2(req2, context);
    console.log(response2);
    
    const res2 = await admin_db.doc(`/users/${aliceUserId}/secret/onetime`).get();
    const resdata2 = res2.data();
    console.log(resdata2);
    // run test
    const req3 = {token: resdata.smscode.token};
    const wrapped3 = test.wrap(index.confirmOnetimeSMS);

    const response3 = await wrapped3(req3, context);
    console.log(response3);
    const res3 = await admin_db.doc(`/users/${aliceUserId}/secret/onetime`).get();
    const resdata3 = res3.data();
    console.log(resdata3);
  })

});