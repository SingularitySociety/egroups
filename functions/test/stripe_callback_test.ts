import * as supertest from 'supertest';
import * as express from '../src/functions/express';
import { should } from 'chai';

import * as stripeWebHookData from "./testData/stripeWebHookData";

should()

describe('Hello function', () => {
  it('should valid api callback', async () => {
    // console.log(stripeWebHookData.stripeData.customer_subscription_deleted);
    
    const request = supertest(express.app);
    const response = await request.get("/1.0/hello")
      .send(stripeWebHookData.stripeData.customer_subscription_deleted)
      .set('Accept', 'application/json')
      .expect('Content-Type', /json/)
      .expect(200);


    response.status.should.equal(200);
  });
});
