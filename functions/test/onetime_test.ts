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

    await admin_db.doc(`/users/${aliceUserId}`).set({uid: aliceUserId});
    
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

    // run test invalid token
    const req2 = {};
    const wrapped2 = test.wrap(index.confirmOnetimeSMS);

    const response2 = await wrapped2(req2, context);
    response2.result.should.equal(false)
    
    const res2 = await admin_db.doc(`/users/${aliceUserId}/secret/onetime`).get();
    const resdata2 = res2.data();
    resdata2.smscode.count.should.equal(1)
    resdata2.smscode.phone.should.equal('+819087123456')
    
    // run test
    const req3 = {token: resdata.smscode.token};
    const wrapped3 = test.wrap(index.confirmOnetimeSMS);

    const response3 = await wrapped3(req3, context);
    response3.result.should.equal(true);

    const res3 = await admin_db.doc(`/users/${aliceUserId}/secret/onetime`).get();
    const resdata3 = res3.data();
    resdata3.supermario.should.be.a("object")
    resdata3.supermario.token.should.be.a("string")
    resdata3.supermario.ttl.should.be.a("number")
    
  })

  it ('Onetime SMS 5 times failed test', async function() {
    const uuid = UUID();
    const aliceUserId = "test_phone_" + uuid;

    await admin_db.doc(`/users/${aliceUserId}`).set({uid: aliceUserId});
    
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

    // run test invalid token
    // user can faild 5 times
    for(let i = 0; i < 5; i ++) {
      const req2 = {};
      const wrapped2 = test.wrap(index.confirmOnetimeSMS);

      const response2 = await wrapped2(req2, context);
      response2.result.should.equal(false)
    
      const res2 = await admin_db.doc(`/users/${aliceUserId}/secret/onetime`).get();
      const resdata2 = res2.data();
      resdata2.smscode.count.should.equal(i+1)
      resdata2.smscode.phone.should.equal('+819087123456')
    }
    // run test
    const req3 = {token: "abc"};
    const wrapped3 = test.wrap(index.confirmOnetimeSMS);

    const response3 = await wrapped3(req3, context);
    response3.result.should.equal(false);
  })


  it ('Onetime SMS ttl test', async function() {
    const uuid = UUID();
    const aliceUserId = "test_phone_" + uuid;

    await admin_db.doc(`/users/${aliceUserId}`).set({uid: aliceUserId});
    
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

    const res2 = await admin_db.doc(`/users/${aliceUserId}/secret/onetime`).get();
    const resdata2 = res2.data();
    resdata2.smscode.ttl = Math.round(Date.now() / 1000) - 1;
    await admin_db.doc(`/users/${aliceUserId}/secret/onetime`).set(resdata2)
      
    // run test
    const req3 = {token: resdata.smscode.token};
    const wrapped3 = test.wrap(index.confirmOnetimeSMS);

    const response3 = await wrapped3(req3, context);
    response3.result.should.equal(false);
  })
  
});