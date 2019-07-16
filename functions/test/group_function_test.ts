import * as test_helper from "../../lib/test/rules/test_helper";
import * as functions_test_helper from "./functions_test_helper";
import * as stripeApi from '../src/apis/stripe';
import * as stripeUtils from "../src/utils/stripe"

import { should } from 'chai';
import * as UUID from "uuid-v4";

const {index, admin_db, test} = functions_test_helper.initFunctionsTest();

should()

const checkCancel = async (db, groupId, userId, cancel) => {
  const subscriptionRaw = (await db.doc(`/groups/${groupId}/members/${userId}/secret/stripe`).get()).data()
  subscriptionRaw.subscription.cancel_at_period_end.should.equal(cancel);
  const memberStripe = (await db.doc(`/groups/${groupId}/members/${userId}/private/stripe`).get()).data();
  memberStripe.subscription.cancel_at_period_end.should.equal(cancel);
  const userPrivate = (await db.doc(`users/${userId}/private/stripe`).get()).data();
  userPrivate.subscription[groupId].cancel_at_period_end.should.equal(cancel);
}

const createDataForSubscription = async (userId, groupId, price, currency, ) => {
  // need group, product, plan, 
  await admin_db.doc(`users/${userId}`).set({
    uid: userId,
  })
  
  const alice_group = admin_db.doc(`groups/${groupId}`);
  await test_helper.create_group(alice_group, "hello", "hello", true);
      
  const stripeGroupSecretRef = admin_db.doc(`/groups/${groupId}/secret/stripe`);
  const production = await stripeApi.createProduct(groupId, "hello", groupId);
  
  const plan = await stripeApi.createPlan(groupId, price, currency);
  const plan_key = [String(price), currency].join("_")
  
  await stripeGroupSecretRef.set({
    production: production,
    plans: {[plan_key]: plan},
  }, {merge:true}); 
  
  // need customer
  const visa_source = await functions_test_helper.createVisaCard();
  const visa_token = visa_source.id;
  
  await stripeApi.createCustomer(visa_token, userId);
}

describe('Group function test', () => {
  it ('update test', async function() {
    this.timeout(10000);

    const groupId = "123_" + UUID();

    const uuid = UUID();
    const aliceUserId = "test_customer_" + uuid;

    const wrapped = test.wrap(index.groupDidUpdate);
    
    const beforeGroupDataSnap = test.firestore.makeDocumentSnapshot({
      groupName: "hello",
      owner: aliceUserId, 
    }, `groups/${groupId}`);
    const afterGroupDataSnap = test.firestore.makeDocumentSnapshot({
      groupName: "hello",
      subscription: true,
      owner: aliceUserId, 
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

    const context = {
      params: {
        groupId: groupId,
      },
      auth: {
        uid: aliceUserId,
      }
    };
    await wrapped(change, context);

    const data = (await admin_db.doc(`/groups/${groupId}/secret/stripe`).get()).data()

    const productionId = stripeUtils.getProductId(groupId);
    const plan2000Id = stripeUtils.getPlanId(groupId, 2000, "jpy");
    const plan3000Id = stripeUtils.getPlanId(groupId, 3000, "jpy");
    const plan30Id = stripeUtils.getPlanId(groupId, 30, "usd");
    
    const planData = data.plans;

    const planData2000 = planData["2000_jpy"];
    planData2000.active.should.equal(true);
    planData2000.amount.should.equal(2000);
    planData2000.billing_scheme.should.equal('per_unit');
    planData2000.currency.should.equal('jpy');
    planData2000.id.should.equal(plan2000Id);
    planData2000.interval.should.equal('month');
    planData2000.interval_count.should.equal(1);
    planData2000.livemode.should.equal(false);
    planData2000.object.should.equal('plan');
    planData2000.product.should.equal(productionId);
    planData2000.usage_type.should.equal('licensed');
      
    const planData3000 = planData["3000_jpy"];
    planData3000.active.should.equal(true);
    planData3000.amount.should.equal(3000);
    planData3000.billing_scheme.should.equal('per_unit');
    planData3000.currency.should.equal('jpy');
    planData3000.id.should.equal(plan3000Id);
    planData3000.interval.should.equal('month');
    planData3000.interval_count.should.equal(1);
    planData3000.livemode.should.equal(false);
    planData3000.object.should.equal('plan');
    planData3000.product.should.equal(productionId);
    planData3000.usage_type.should.equal('licensed');

    const production = data.production;
    production.active.should.equal(true);
    production.id.should.equal(productionId);
    production.livemode.should.equal(false);
    production.metadata.should.deep.equal({ groupId: groupId });
    production.name.should.equal('hello');
    production.object.should.equal('product');
    production.statement_descriptor.should.equal('hello');
    production.type.should.equal('service');

    const data2 = (await admin_db.doc(`/groups/${groupId}/private/stripe`).get()).data()
    data2.should.deep.equal({ plans:
                              [ { active: true,
                                  amount: 2000,
                                  currency: 'jpy',
                                  id: plan2000Id,
                                  interval: 'month',
                                  interval_count: 1 },
                                { active: true,
                                  amount: 3000,
                                  currency: 'jpy',
                                  id: plan3000Id,
                                  interval: 'month',
                                  interval_count: 1 },
                                { active: true,
                                  amount: 30,
                                  currency: 'usd',
                                  id: plan30Id,
                                  interval: 'month',
                                  interval_count: 1 } ],
                              production:
                              { active: true,
                                id: productionId,
                                name: 'hello',
                                statement_descriptor: 'hello',
                                type: 'service' } });

    await wrapped(change, context);
    
  });

  it ('stripe create customer test', async function() {
    this.timeout(10000);
    const uuid = UUID();
    const aliceUserId = "test_customer_" + uuid;

    await admin_db.doc(`users/${aliceUserId}`).set({
      uid: aliceUserId,
    })

    const visa_source = await functions_test_helper.createVisaCard();
    const visa_token = visa_source.id;
    
    const req = {token: visa_token};
    const context = {auth: {uid: aliceUserId}};
    const wrapped = test.wrap(index.createCustomer);

    await wrapped(req, context);

    const stripeCustomerSecret = (await admin_db.doc(`users/${aliceUserId}/secret/stripe`).get())
    const stripeCustomerSecretData = stripeCustomerSecret.data();
    const customerId = stripeUtils.getCustomerId(aliceUserId);
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

    const stripeCustomerPrivate = (await admin_db.doc(`users/${aliceUserId}/private/stripe`).get())
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
                                               
    await stripeApi.deleteCustomer(aliceUserId);
  });


  it ('stripe create subscription test', async function() {
    this.timeout(10000);
    const uuid = UUID();
    const aliceUserId = "test_customer_" + uuid;
    const groupId = "sub_test";

    const price = 5000;
    const currency = "jpy";

    await createDataForSubscription(aliceUserId, groupId, price, currency);
    // end of create

    // run test
    const req = {groupId, plan: {price, currency}};
    const context = {auth: {uid: aliceUserId}};
    const wrapped = test.wrap(index.createSubscription);

    await wrapped(req, context);

    const subscriptionRaw = (await admin_db.doc(`/groups/${groupId}/members/${aliceUserId}/secret/stripe`).get()).data()
    subscriptionRaw.subscription.billing.should.equal('charge_automatically');
    subscriptionRaw.subscription.collection_method.should.equal('charge_automatically');
    subscriptionRaw.subscription.object.should.equal('subscription');
    subscriptionRaw.subscription.plan.active.should.equal(true);
    subscriptionRaw.subscription.plan.amount.should.equal(5000);
    subscriptionRaw.subscription.plan.billing_scheme.should.equal('per_unit');
    subscriptionRaw.subscription.plan.currency.should.equal('jpy');
    subscriptionRaw.subscription.plan.id.should.equal('plan_sub_test_5000_jpy');
    subscriptionRaw.subscription.plan.interval.should.equal('month');
    subscriptionRaw.subscription.plan.interval_count.should.equal(1);
    subscriptionRaw.subscription.plan.object.should.equal('plan');
    subscriptionRaw.subscription.plan.usage_type.should.equal('licensed');
    subscriptionRaw.subscription.quantity.should.equal(1);
    subscriptionRaw.subscription.status.should.equal('active');

    const member = (await admin_db.doc(`/groups/${groupId}/members/${aliceUserId}`).get()).data();
    member.displayName.should.equal('---');
    member.groupId.should.equal('sub_test');
    member.userId.should.equal(aliceUserId);
      
    const memberStripe = (await admin_db.doc(`/groups/${groupId}/members/${aliceUserId}/private/stripe`).get()).data();
    memberStripe.subscription.billing.should.equal('charge_automatically');
    memberStripe.subscription.object.should.equal('subscription');
    memberStripe.subscription.plan.active.should.equal(true);
    memberStripe.subscription.plan.amount.should.equal(5000);
    memberStripe.subscription.plan.currency.should.equal('jpy');
    memberStripe.subscription.plan.interval.should.equal('month');
    memberStripe.subscription.plan.interval_count.should.equal(1);
    memberStripe.subscription.quantity.should.equal(1);
    memberStripe.subscription.status.should.equal('active');
    

    const userPrivate = (await admin_db.doc(`users/${aliceUserId}/private/stripe`).get()).data();
    
    userPrivate.subscription.sub_test.billing.should.equal('charge_automatically');
    userPrivate.subscription.sub_test.object.should.equal('subscription');
    userPrivate.subscription.sub_test.plan.active.should.equal(true);
    userPrivate.subscription.sub_test.plan.amount.should.equal(5000);
    userPrivate.subscription.sub_test.plan.currency.should.equal('jpy');
    userPrivate.subscription.sub_test.plan.interval.should.equal('month');
    userPrivate.subscription.sub_test.plan.interval_count.should.equal(1);
    userPrivate.subscription.sub_test.quantity.should.equal(1);
    userPrivate.subscription.sub_test.status.should.equal('active');
  });

  it ('stripe cancel subscription test', async function() {
    this.timeout(10000);
    const uuid = UUID();

    const aliceUserId = "test_customer_" + uuid;
    const groupId = "sub_test";
    const price = 5000;
    const currency = "jpy";

    await createDataForSubscription(aliceUserId, groupId, price, currency);

    const planId = stripeUtils.getPlanId(groupId, price, currency);
    const subscription = await stripeApi.createSubscription(aliceUserId, groupId, planId);

    await admin_db.doc(`/groups/${groupId}/members/${aliceUserId}/secret/stripe`).set({
      subscription: subscription
    });
    // end of create
    
    // run test
    const subscriptionId = subscription.id;
    
    const req = {groupId};
    const context = {auth: {uid: aliceUserId}};
    const wrapped = test.wrap(index.cancelSubscription);

    await wrapped(req, context);

    const subscription2 = await stripeApi.retrieveSubscription(subscriptionId);
    subscription2.cancel_at_period_end.should.equal(true);

    await checkCancel(admin_db, groupId, aliceUserId, true);
    
    const req2 = {groupId, subscriptionId: subscriptionId, cancel: false};
    const wrapped2 = test.wrap(index.cancelSubscription);

    await wrapped2(req2, context);

    const subscription3 = await stripeApi.retrieveSubscription(subscriptionId);
    subscription3.cancel_at_period_end.should.equal(false);
    await checkCancel(admin_db, groupId, aliceUserId, false);
    
  });

  it ('stripe create customer test', async function() {
    this.timeout(10000);
    const aliceUserId = "test_user_" + UUID();
    const groupId = "group_" + UUID();
    const path = UUID();
    const title = UUID();
    const types = {
      open: true,
      subscription: true,
    };
    
    await admin_db.doc(`groups/${groupId}`).set({
      owner: aliceUserId,
    })
    
    const req = {groupId, path, title, types};
    const context = {auth: {uid: aliceUserId}};
    const wrapped = test.wrap(index.createGroupName);

    await wrapped(req, context);

    const secret = (await admin_db.doc(`groups/${groupId}/secret/account`).get()).data();
    secret.account.country.should.equal('JP')
    secret.account.default_currency.should.equal('jpy')
    secret.account.metadata.groupId.should.equal(groupId)
    secret.account.object.should.equal('account')
    secret.account.type.should.equal('custom' )


  });
});
