import * as test_helper from "../../lib/test/rules/test_helper";
import * as functions_test_helper from "./functions_test_helper";
import * as index from '../src/index';
import * as stripe from '../src/apis/stripe';

import * as Test from 'firebase-functions-test';

import { should } from 'chai';
import * as UUID from "uuid-v4";

const admin_db = test_helper.adminDB();
index.updateDb(admin_db);

should()

describe('Group function test', () => {
  it ('update test', async function() {
    this.timeout(10000);

    const groupId = "123"

    const test = Test();
    test.mockConfig({ stripe: { secret_key: process.env.STRIPE_SECRET }});

    const wrapped = test.wrap(index.groupDidUpdate);
    
    const beforeGroupDataSnap = test.firestore.makeDocumentSnapshot({
      groupName: "hello",
    }, `groups/${groupId}`);
    const afterGroupDataSnap = test.firestore.makeDocumentSnapshot({
      groupName: "hello",
      subscription: true,
      plans: [{ price: 2000,
                title: "学生会員",
                currency: "jpy",
              },
              { price: 3000,
                title: "一般会員",
                currency: "jpy",
              },
              { price: 30,
                title: "student",
                currency: "usd",
              }],
    }, `groups/${groupId}`);
    const change = test.makeChange(beforeGroupDataSnap, afterGroupDataSnap);

    await wrapped(change, {
      params: {
        groupId: groupId,
      }
    });

    await wrapped(change, {
      params: {
        groupId: groupId,
      }
    });
    const data = (await admin_db.doc(`/groups/${groupId}/secret/stripe`).get()).data()
    
    const planData = data.plans;
    const planData2000 = planData["2000_jpy"];
    planData2000.active.should.equal(true);
    planData2000.amount.should.equal(2000);
    planData2000.billing_scheme.should.equal('per_unit');
    planData2000.currency.should.equal('jpy');
    planData2000.id.should.equal('plan_123_2000_jpy');
    planData2000.interval.should.equal('month');
    planData2000.interval_count.should.equal(1);
    planData2000.livemode.should.equal(false);
    planData2000.object.should.equal('plan');
    planData2000.product.should.equal('prod_123');
    planData2000.usage_type.should.equal('licensed');
      
    const planData3000 = planData["3000_jpy"];
    planData3000.active.should.equal(true);
    planData3000.amount.should.equal(3000);
    planData3000.billing_scheme.should.equal('per_unit');
    planData3000.currency.should.equal('jpy');
    planData3000.id.should.equal('plan_123_3000_jpy');
    planData3000.interval.should.equal('month');
    planData3000.interval_count.should.equal(1);
    planData3000.livemode.should.equal(false);
    planData3000.object.should.equal('plan');
    planData3000.product.should.equal('prod_123');
    planData3000.usage_type.should.equal('licensed');

    const production = data.production;
    production.active.should.equal(true);
    production.id.should.equal('prod_123');
    production.livemode.should.equal(false);
    production.metadata.should.deep.equal({ groupId: '123' });
    production.name.should.equal('hello');
    production.object.should.equal('product');
    production.statement_descriptor.should.equal('hello');
    production.type.should.equal('service');

    const data2 = (await admin_db.doc(`/groups/${groupId}/private/stripe`).get()).data()
    data2.should.deep.equal({ plans:
                              [ { active: true,
                                  amount: 2000,
                                  currency: 'jpy',
                                  id: 'plan_123_2000_jpy',
                                  interval: 'month',
                                  interval_count: 1 },
                                { active: true,
                                  amount: 3000,
                                  currency: 'jpy',
                                  id: 'plan_123_3000_jpy',
                                  interval: 'month',
                                  interval_count: 1 },
                                { active: true,
                                  amount: 30,
                                  currency: 'usd',
                                  id: 'plan_123_30_usd',
                                  interval: 'month',
                                  interval_count: 1 } ],
                              production:
                              { active: true,
                                id: 'prod_123',
                                name: 'hello',
                                statement_descriptor: 'hello',
                                type: 'service' } });

  });

  it ('stripe create customer test', async function() {
    this.timeout(10000);
    const uuid = UUID();
    const aliceUID = "test_customer_" + uuid;

    await admin_db.doc(`users/${aliceUID}`).set({
      uid: aliceUID,
    })

    const visa_source = await functions_test_helper.createVisaCard();
    const visa_token = visa_source.id;
    
    const test = Test();
    test.mockConfig({ stripe: { secret_key: process.env.STRIPE_SECRET }});

    const req = {token: visa_token};
    const context = {auth: {uid: aliceUID}};
    const wrapped = test.wrap(index.createCustomer);

    await wrapped(req, context);

    const stripeCustomerSecret = (await admin_db.doc(`users/${aliceUID}/secret/stripe`).get())
    const stripeCustomerSecretData = stripeCustomerSecret.data();
    const customerId = stripe.getCustomerId(aliceUID);
    stripeCustomerSecretData.customer.id.should.equal(customerId);
    stripeCustomerSecretData.customer.object.should.equal('customer');
    stripeCustomerSecretData.customer.default_source.should.equal(stripeCustomerSecretData.customer.sources.data[0].id);

    stripeCustomerSecretData.customer.sources.data[0].brand.should.equal('Visa');
    stripeCustomerSecretData.customer.sources.data[0].customer.should.equal(customerId);
    stripeCustomerSecretData.customer.sources.data[0].country.should.equal('US');
    stripeCustomerSecretData.customer.sources.data[0].exp_month.should.equal(8);
    stripeCustomerSecretData.customer.sources.data[0].exp_year.should.equal(2025);
    stripeCustomerSecretData.customer.sources.data[0].funding.should.equal('credit');
    stripeCustomerSecretData.customer.sources.data[0].last4.should.equal('4242');
    stripeCustomerSecretData.customer.sources.data[0].object.should.equal('card');

    const stripeCustomerPrivate = (await admin_db.doc(`users/${aliceUID}/private/stripe`).get())
    const stripeCustomerPrivateData = stripeCustomerPrivate.data();

    stripeCustomerPrivateData.should.deep.equal({
      customer:
      [ { brand: 'Visa',
          country: 'US',
          exp_month: 8,
          exp_year: 2025,
          funding: 'credit',
          last4: '4242' } ]
    })
                                               
    
    await stripe.deleteCustomer(aliceUID);
  });


  it ('stripe create subscription test', async function() {
    this.timeout(10000);
    const uuid = UUID();
    const aliceUID = "test_customer_" + uuid;

    // need group, product, plan, 
    await admin_db.doc(`users/${aliceUID}`).set({
      uid: aliceUID,
    })

    const test = Test();
    test.mockConfig({ stripe: { secret_key: process.env.STRIPE_SECRET }});

    const groupId = "sub_test";

    await stripe.createProduct(groupId, "hello", groupId);
    const plan = await stripe.createPlan(groupId, 5000, "jpy");
    
    const req = {groupId, plan: plan.id};
    const context = {auth: {uid: aliceUID}};
    const wrapped = test.wrap(index.createSubscribe);

    await wrapped(req, context);

  });
});