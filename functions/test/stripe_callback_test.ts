import * as test_helper from "../../lib/test/rules/test_helper";
import * as supertest from 'supertest';
import * as express from '../src/functions/express';
import { should } from 'chai';

import * as stripeWebHookData from "./testData/stripeWebHookData";

const admin_db = test_helper.adminDB();

express.updateDb(admin_db);

should()

describe('Hello function', () => {
  it('should valid api callback', async () => {
    const request = supertest(express.app);
    const response = await request.get("/1.0/hello")
      .send(stripeWebHookData.stripeData.customer_subscription_deleted)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);


    response.status.should.equal(200);
  });

  it('should valid api callback', async () => {
    const userId = "test_customer_4cbbdacb-8601-4562-9340-bd323d2018c7";
    const groupId = "sub_test";
    await admin_db.doc(`/users/${userId}/private/stripe`).set({
      subscription: {[groupId]: "hello"},
    });
    const data = (await admin_db.doc(`/users/${userId}/private/stripe`).get()).data();
    data.subscription[groupId].should.equal("hello");
    await express.customer_subscription_deleted(stripeWebHookData.stripeData.customer_subscription_deleted); 
    const data2 = (await admin_db.doc(`/users/${userId}/private/stripe`).get()).data();
    should().not.exist(data2.subscription[groupId])
 });

  it('should valid api callback', async () => {
    await express.charge_succeeded(stripeWebHookData.stripeData.charge_succeeded);
  });

  it('should valid api callback', async () => { 
    const userId = "test_customer_ac003e4f-f263-457a-8d4b-27586af24f3f";
    const groupId = "unit_test_plan";
    await admin_db.doc(`/groups/${groupId}/members/${userId}`).set({
      displayName: "---",
    });
    await admin_db.doc(`/groups/${groupId}/members/${userId}/private/stripe`).set({
      subscription: {},
      period: {
        start: 0,
        end: 1,
      }
    });
    
    await express.invoice_payment_succeeded(stripeWebHookData.stripeData.invoice_payment_succeeded);

    // confirm data
    const invoice = (await admin_db.doc(`/users/${userId}/private/stripe/invoice/1562364003_evt_1EszRoJRcJsJLSj6FNDluYcd`).get()).data();
    invoice.created.should.equal(1562364002)
    invoice.groupId.should.equal('unit_test_plan')
    invoice.invoiceUrl.should.equal('https://pay.stripe.com/invoice/invst_bdxqbrKhnuEjJu7oIi0UouxE3x/pdf')
    
    const period = (await admin_db.doc(`/groups/${groupId}/members/${userId}/private/stripe`).get()).data();
    period.period.end.should.equal(1562364002);
    
    const period2 = (await admin_db.doc(`/groups/${groupId}/members/${userId}`).get()).data();
    period2.period.end.should.equal(1562364002);
    period2.displayName.should.equal("---");

    const res = await admin_db.collection("/stripelog").orderBy("created", "desc").limit(2).get();
    res.forEach(async doc => {
      console.log(await doc.data());
    });
  });

});
