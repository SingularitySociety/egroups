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
    express.customer_subscription_deleted(stripeWebHookData.stripeData.customer_subscription_deleted);
  });

  it('should valid api callback', async () => {
    express.charge_succeeded(stripeWebHookData.stripeData.charge_succeeded);
  });

  it('should valid api callback', async () => {
    express.invoice_payment_succeeded(stripeWebHookData.stripeData.invoice_payment_succeeded);
    const res = await admin_db.collection("/stripelog").limit(1).get();
    res.forEach(async doc => {
      console.log(await doc.data().log.data.object);
    });
  });

});
