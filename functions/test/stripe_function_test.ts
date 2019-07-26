import * as functions_test_helper from "./functions_test_helper";
import * as stripe from '../src/functions/stripe';
import * as test_helper from "../../lib/test/rules/test_helper";
import * as stripeApi from '../src/apis/stripe';
import * as stripeUtils from "../src/utils/stripe"

import * as stripeCustomAccountData from './testData/stripeCustomAccountData'
import * as image_function from '../src/functions/image';

import { should } from 'chai';
import * as UUID from "uuid-v4";
import * as fs from 'fs';

const {index, admin_db, test} = functions_test_helper.initFunctionsTest();

should()

export const writeFile = (name, json) => {
  fs.writeFileSync(`${__dirname}/rawData/${name}`, JSON.stringify(json, undefined, 1));
}

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

const createOnetime = async (userId) => {
  const token = UUID().replace(/\-/g,"");
  const supermario = {
    ttl: Math.round(Date.now()  / 1000) + 3600,
    token: token,
  }
  await admin_db.doc(`/users/${userId}/secret/onetime`).set({supermario});
  return token;

}

const downloadFunc = (object) => {
  const tmpFile = __dirname + '/testData/1.jpg';
  return tmpFile;
}
const removeFile = (object) => {
  console.log(object);
}
describe('function test', () => {
  it ('stripe error test', async function() {
    const error = await stripe.createSubscription("", "", "");
    error.should.deep.equal({
      result: false,
      error: {
        message: 'invalid request',
        type: 'Error',
        error_message: 'createSubscription error: no authentication info',
      }        
    });
  })

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

    const onetimetoken = await createOnetime(aliceUserId);
    // end of create

    // run test
    const req_error = {groupId, plan: {price, currency}};
    const context = {auth: {uid: aliceUserId}};
    const wrapped = test.wrap(index.createSubscription);
    const error_response = await wrapped(req_error, context);
    error_response.result.should.equal(false)
    error_response.error.type.should.equal("Error");
    
    const req_error2 = {groupId, plan: {price, currency}, onetimetoken: "abc123"};
    const error_response2 = await wrapped(req_error2, context);
    error_response2.result.should.equal(false)
    error_response2.error.type.should.equal("OnetimeKey");
    // run test
    const req = {groupId, plan: {price, currency}, onetimetoken};
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
    this.timeout(50000);
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

  it ('stripe create error test', async function() {
    this.timeout(80000);
    const aliceUserId = "test_user_" + UUID();
    const groupId = "group_" + UUID();
    const country = "JP";
    const business_type = "hogehoge";
    
    await admin_db.doc(`groups/${groupId}`).set({
      owner: aliceUserId,
      subscription: true,
    })
    
    const req = {groupId, country, business_type};
    const context = {auth: {uid: aliceUserId}};
    const wrappedCreate = test.wrap(index.createCustomAccount);

    const res = await wrappedCreate(req, context);
    res.result.should.equal(false)
  });

  it ('stripe create and update customer in JP individual test', async function() {
    this.timeout(80000);
    const aliceUserId = "test_user_" + UUID();
    const groupId = "group_" + UUID();
    const country = "JP";
    const business_type = "individual";
    
    await admin_db.doc(`groups/${groupId}`).set({
      owner: aliceUserId,
      subscription: true,
    })
    
    const req = {groupId, country, business_type};
    const context = {auth: {uid: aliceUserId}};
    const wrappedCreate = test.wrap(index.createCustomAccount);

    const res = await wrappedCreate(req, context);
    res.result.should.equal(true)
    console.log(res);
    const secret = (await admin_db.doc(`groups/${groupId}/secret/account`).get()).data();
    secret.account.country.should.equal('JP')
    secret.account.default_currency.should.equal('jpy')
    secret.account.metadata.groupId.should.equal(groupId)
    secret.account.object.should.equal('account')
    secret.account.type.should.equal('custom' )

    const res1 = await wrappedCreate(req, context);
    res1.result.should.equal(false)
    writeFile("individual-create", res1.account);
    
    const req2 = {groupId,
                  ip: "211.132.97.58",
                  business_type: "individual",
                  account_data: stripeCustomAccountData.postData["individual"]};
    const wrappedUpdate = test.wrap(index.updateCustomAccount);
    const res2 = await wrappedUpdate(req2, context);
    writeFile("individual-update", res2.account);
    res2.result.should.equal(true)
    console.log(res2);
    

    const req3 = {groupId,
                  business_type: "individual",
                  account_data: stripeCustomAccountData.postData["individual"]};
    const res3 = await wrappedUpdate(req3, context);
    res3.result.should.equal(true)

    const req4 = {groupId,
                  business_type: "individual",
                  external_account: stripeCustomAccountData.bank_jp};
    const res4 = await wrappedUpdate(req4, context);
    res4.result.should.equal(true)
    res4.account.external_accounts.total_count.should.equal(1)
    // error
    const req10 = {groupId,
                  business_type: "individual",
                  account_data: stripeCustomAccountData.postData["invalid_individual"]};
    const error_res = await wrappedUpdate(req10, context);
    error_res.result.should.equal(false);

    const req11 = {groupId,
                  business_type: "company",
                  account_data: stripeCustomAccountData.postData["individual"]};
    const res11 = await wrappedUpdate(req11, context);
    res11.result.should.equal(false)

    const req12 = {groupId,
                  account_data: stripeCustomAccountData.postData["individual"]};
    const res12 = await wrappedUpdate(req12, context);
    res12.result.should.equal(false)

    // upload file
    const filePath = `groups/${groupId}/owner/verification/front`;
    const object = {
      name: filePath,
    };
    await image_function.uploadStripeImage(admin_db, object, downloadFunc, removeFile);

  });

  it ('stripe create and update customer in JP company test', async function() {
    this.timeout(80000);
    const aliceUserId = "test_user_" + UUID();
    const groupId = "group_" + UUID();
    const country = "JP";
    
    await admin_db.doc(`groups/${groupId}`).set({
      owner: aliceUserId,
      subscription: true,
    })
    
    const context = {auth: {uid: aliceUserId}};
    const wrappedCreate = test.wrap(index.createCustomAccount);

    await admin_db.doc(`groups/${groupId}`).set({
      owner: aliceUserId,
      subscription: true,
    })

    const req20 = {groupId: groupId, country};
    const res20 = await wrappedCreate(req20, context);
    res20.result.should.equal(true)

    const req21 = {
      groupId: groupId,
      ip: "211.132.97.58",
      business_type: "company",
      account_data: stripeCustomAccountData.postData["company"],
      personal_data: stripeCustomAccountData.postData["person"],
      external_account: stripeCustomAccountData.bank_jp,
    };
    const wrappedUpdate = test.wrap(index.updateCustomAccount);
    const res21 = await wrappedUpdate(req21, context);
    res21.result.should.equal(true)
    res21.account.payouts_enabled.should.equal(true)
    res21.person.should.to.be.a("object");
    res21.account.should.to.be.a("object");
    writeFile("company-update", res21.account);

    // upload file
    const filePath = `groups/${groupId}/owner/verification/front`;
    const object = {
      name: filePath,
    };
    await image_function.uploadStripeImage(admin_db, object, downloadFunc, removeFile);

  });

  it ('stripe create and update customer in US individual test', async function() {
    this.timeout(30000);
    const aliceUserId = "test_user_" + UUID();
    const groupId = "group_" + UUID();
    const country = "US";
    
    await admin_db.doc(`groups/${groupId}`).set({
      owner: aliceUserId,
      subscription: true,
    })
    
    const req = {groupId, country};
    const context = {auth: {uid: aliceUserId}};
    const wrapped = test.wrap(index.createCustomAccount);

    // just create
    const res = await wrapped(req, context);
    res.result.should.equal(true)
    
    const secret = (await admin_db.doc(`groups/${groupId}/secret/account`).get()).data();
    secret.account.country.should.equal('US')
    secret.account.default_currency.should.equal('usd')
    secret.account.metadata.groupId.should.equal(groupId)
    secret.account.object.should.equal('account')
    secret.account.type.should.equal('custom' )

    // can't create again
    const res1 = await wrapped(req, context);
    res1.result.should.equal(false)
    
    // set personal data
    const req2 = {groupId,
                  ip: "211.132.97.58",
                  business_type: "individual",
                  account_data: stripeCustomAccountData.postDataUS["individual"]};
    const wrapped2 = test.wrap(index.updateCustomAccount);
    const res2 = await wrapped2(req2, context);
    res2.result.should.equal(true)
    
    // just update personal data
    const req3 = {groupId,
                  business_type: "individual",
                  account_data: stripeCustomAccountData.postDataUS["individual"]};
    const res3 = await wrapped2(req3, context);
    res3.result.should.equal(true)

    // set bank
    const req4 = {groupId,
                  business_type: "individual",
                  business_profile: stripeCustomAccountData.postDataUS["business_profile2"],
                  external_account: stripeCustomAccountData.bank_us};
    const res4 = await wrapped2(req4, context);
    res4.result.should.equal(true)
    res4.account.external_accounts.total_count.should.equal(1)
    res4.account.payouts_enabled.should.equal(true)

    const req11 = {groupId,
                   business_type: "company",
                   account_data: stripeCustomAccountData.postDataUS["individual"]};
    const res11 = await wrapped2(req11, context);
    res11.result.should.equal(false)
    
    const req12 = {groupId,
                  account_data: stripeCustomAccountData.postDataUS["individual"]};
    const res12 = await wrapped2(req12, context);
    res12.result.should.equal(false)

    // upload file
    const filePath = `groups/${groupId}/owner/verification/front`;
    const object = {
      name: filePath,
    };
    await image_function.uploadStripeImage(admin_db, object, downloadFunc, removeFile);
  })

  it ('stripe create and update customer in US company test', async function() {
    this.timeout(30000);
    const aliceUserId = "test_user_" + UUID();
    const groupId = "group_" + UUID();
    const country = "US";
    
    await admin_db.doc(`groups/${groupId}`).set({
      owner: aliceUserId,
      subscription: true,
    })
    
    const context = {auth: {uid: aliceUserId}};
    const wrapped = test.wrap(index.createCustomAccount);
  
    const req20 = {groupId: groupId, country};
    const res20 = await wrapped(req20, context);
    res20.result.should.equal(true)

    const req21 = {groupId: groupId,
                   ip: "211.132.97.58",
                   business_type: "company",
                   business_profile: stripeCustomAccountData.postDataUS["business_profile"],
                   account_data: stripeCustomAccountData.postDataUS["company"]};
    const wrapped21 = test.wrap(index.updateCustomAccount);
    const res21 = await wrapped21(req21, context);

    res21.result.should.equal(true)
    res21.account.payouts_enabled.should.equal(false);
    // set bank
    const req22 = {groupId: groupId,
                   ip: "211.132.97.58",
                   business_type: "company",
                   external_account: stripeCustomAccountData.bank_us};
    const res22 = await wrapped21(req22, context);
    res22.result.should.equal(true)
    res22.account.external_accounts.total_count.should.equal(1)
    res22.account.payouts_enabled.should.equal(true);
  });
  
  it ('stripe create customer test', async function() {
    this.timeout(10000);
    const aliceUserId = "test_user_" + UUID();
    const groupId = "group_" + UUID();
    const country = "US";
    
    await admin_db.doc(`groups/${groupId}`).set({
      owner: aliceUserId,
      subscription: true,
    })
    
    const req = {groupId, country};
    const context = {auth: {uid: aliceUserId}};
    const wrapped = test.wrap(index.createCustomAccount);

    await wrapped(req, context);

    const secret = (await admin_db.doc(`groups/${groupId}/secret/account`).get()).data();
    secret.account.country.should.equal('US')
    secret.account.default_currency.should.equal('usd')
    secret.account.metadata.groupId.should.equal(groupId)
    secret.account.object.should.equal('account')
    secret.account.type.should.equal('custom' )

    const req2 = {groupId,
                  business_type: "individual",
                  account_data: {}};
    const wrapped2 = test.wrap(index.updateCustomAccount);
    const res2 = await wrapped2(req2, context);
    res2.result.should.equal(true)

  });

})