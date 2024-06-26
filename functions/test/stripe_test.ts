//import * as supertest from 'supertest';
import * as functions_test_helper from "./functions_test_helper";
import * as stripeApi from '../src/apis/stripe';
import * as stripeUtils from "../src/utils/stripe"

import * as stripeTestUtils from "./stripe_utils"

import { should } from 'chai';
import * as UUID from "uuid-v4";

should()

const groupId = "unit_test_plan";
const SharedGroupId = "shared_unit_test_plan";


describe('Stripe test', () => {

  it ('id test', () => {
    stripeUtils.getProductId(groupId).should.equal("prod_unit_test_plan");
    stripeUtils.getPlanId(groupId, 5000, "jpy").should.equal("plan_unit_test_plan_5000_jpy");
    stripeUtils.getPlanId(groupId, 30, "usd").should.equal("plan_unit_test_plan_30_usd");

    stripeUtils.getUSerIdFromCustomerId("cus_abc").should.equal("abc");
  });

  it('hello', async function() {
    this.timeout(10000);

    const account = await stripeTestUtils.createCustomAccount(groupId);
    const accountId = account.id;

    const product = await stripeApi.createProduct2("unit_test", "hello", groupId, accountId);
    product.id.should.equal(stripeUtils.getProductId(groupId));
    
    product.object.should.equal('product');
    product.active.should.equal(true);
    product.metadata.should.deep.equal({ groupId: 'unit_test_plan' });
    product.name.should.equal('unit_test');
    product.statement_descriptor.should.equal('hello');
    product.type.should.equal('service');
    
    const plan = await stripeApi.createPlan2(groupId, 5000, "jpy", accountId);

    plan.id.should.equal('plan_unit_test_plan_5000_jpy');
    plan.object.should.equal('plan');
    plan.active.should.equal(true);
    plan.amount.should.equal(5000);
    plan.billing_scheme.should.equal('per_unit');
    plan.currency.should.equal('jpy');
    plan.interval.should.equal('month');
    plan.interval_count.should.equal(1);
    plan.livemode.should.equal(false);
    (plan.product as string).should.equal('prod_unit_test_plan');
    plan.usage_type.should.equal('licensed');

    const plan_usd = await stripeApi.createPlan2(groupId, 30, "usd", accountId);

    plan_usd.id.should.equal('plan_unit_test_plan_30_usd');
    plan_usd.object.should.equal('plan');
    plan_usd.active.should.equal(true);
    plan_usd.amount.should.equal(30);
    plan_usd.billing_scheme.should.equal('per_unit');
    plan_usd.currency.should.equal('usd');
    plan_usd.interval.should.equal('month');
    plan_usd.interval_count.should.equal(1);
    plan_usd.livemode.should.equal(false);
    (plan_usd.product as string).should.equal('prod_unit_test_plan');
    plan_usd.usage_type.should.equal('licensed');

  });

  it('token', async function() {
    this.timeout(10000);
    const uuid = UUID();
    const userId =  "test_customer_" + uuid;

    const visa_source = await functions_test_helper.createVisaCard();
    const visa_token = visa_source.id;

    const master_source = await functions_test_helper.createMasterCard();
    const master_token = master_source.id;

    const customer = await stripeApi.createCustomer(visa_token, userId);

    const customerId = stripeUtils.getCustomerId(userId);

    customer.sources.data.length.should.equal(1);

    customer.id.should.equal(customerId);
    customer.object.should.equal('customer');
    customer.default_source.should.equal(customer.sources.data[0].id);
    customer.default_source.should.equal(visa_source.card.id);

    customer.sources.data[0].brand.should.equal('Visa');
    customer.sources.data[0].customer.should.equal(customerId);
    customer.sources.data[0].country.should.equal('US');
    customer.sources.data[0].exp_month.should.equal(8);
    customer.sources.data[0].exp_year.should.equal(2025);
    customer.sources.data[0].funding.should.equal('credit');
    customer.sources.data[0].last4.should.equal('4242');
    customer.sources.data[0].object.should.equal('card');
    
    const customer2 = await stripeApi.createCustomer(master_token, userId);

    customer2.sources.data.length.should.equal(1);

    customer2.id.should.equal(customerId);
    customer2.object.should.equal('customer');
    customer2.default_source.should.equal(customer2.sources.data[0].id);
    customer2.default_source.should.equal(master_source.card.id);

    customer2.sources.data[0].brand.should.equal('MasterCard');
    customer2.sources.data[0].customer.should.equal(customerId);
    customer2.sources.data[0].country.should.equal('US');
    customer2.sources.data[0].exp_month.should.equal(8);
    customer2.sources.data[0].exp_year.should.equal(2025);
    customer2.sources.data[0].funding.should.equal('credit');
    customer2.sources.data[0].last4.should.equal('4444');
    customer2.sources.data[0].object.should.equal('card');
    
    await stripeApi.deleteCustomer(userId);
  });

  it('subscription', async function() {
    this.timeout(50000);
    const uuid = UUID();
    const userId =  "test_customer_" + uuid;
    const email = "hoge@example.com";
    
    const visa_source = await functions_test_helper.createVisaCard();
    const visa_token = visa_source.id;

    const customer = await stripeApi.createCustomer(visa_token, userId);

    const account = await stripeTestUtils.createCustomAccount(SharedGroupId);
    const accountId = account.id;

    const tax = await stripeApi.createTex(accountId);
    
    const customerToken = await stripeApi.createCustomerToken(customer.id, accountId);
    const sharedCustomer = await stripeApi.createSharedCustomer("test subscription", SharedGroupId, userId, email, customerToken.id, accountId);

    const sharedCustomer2 = await stripeApi.getSharedCustomer(SharedGroupId, userId, accountId);
    sharedCustomer.id.should.equal(sharedCustomer2.id);

    try {
      await stripeApi.getSharedCustomer(SharedGroupId, "aaa", accountId);
    } catch (e) {
      console.log(e.statusCode);
      // console.log(e);
    }
    
    await stripeApi.createProduct2("unit_test", "hello", SharedGroupId, accountId);
    const plan = await stripeApi.createPlan2(SharedGroupId, 5000, "jpy", accountId);

    const subscription = await stripeApi.createSubscription2(userId, sharedCustomer.id, SharedGroupId, plan.id, accountId, tax.id);
    subscription.object.should.equal('subscription');
    subscription.customer.should.equal(sharedCustomer.id)

    subscription.billing.should.equal('charge_automatically');
    subscription.collection_method.should.equal('charge_automatically');
    [2419200, 2505600, 2592000, 2678400].should.include(subscription.current_period_end - subscription.current_period_start)

    subscription.items.object.should.equal('list');
    subscription.items.total_count.should.equal(1);

    subscription.plan.id.should.equal(plan.id);
    
    subscription.plan.object.should.equal('plan');
    subscription.plan.active.should.equal(true);
    subscription.plan.amount.should.equal(5000);
    subscription.plan.billing_scheme.should.equal('per_unit');
    subscription.plan.currency.should.equal('jpy');
    subscription.plan.interval.should.equal('month');
    subscription.plan.interval_count.should.equal(1);
    subscription.plan.product.should.equal('prod_shared_unit_test_plan');

    subscription.quantity.should.equal(1);
    subscription.start.should.equal(subscription.current_period_start);
    subscription.start_date.should.equal(subscription.current_period_start);
    subscription.status.should.equal('active');

    subscription.items.object.should.equal('list');

    subscription.items.data[0].plan.object.should.equal('plan');
    subscription.items.data[0].plan.active.should.equal(true);
    subscription.items.data[0].plan.amount.should.equal(5000);
    subscription.items.data[0].plan.billing_scheme.should.equal('per_unit');
    subscription.items.data[0].plan.currency.should.equal('jpy');
    subscription.items.data[0].plan.interval.should.equal('month');
    subscription.items.data[0].plan.interval_count.should.equal(1);
    subscription.items.data[0].plan.product.should.equal('prod_shared_unit_test_plan');
    
    subscription.items.data[0].quantity.should.equal(1);

    const subscription2 = await stripeApi.createSubscription2(userId, sharedCustomer.id, SharedGroupId, plan.id, accountId, tax.id);
    subscription2.id.should.equal(subscription2.id);
    
  });


  it('cancel subscription', async function() {
    this.timeout(20000);
    const uuid = UUID();
    const userId =  "test_customer_" + uuid;
    const email = "hoge@example.com";

    const visa_source = await functions_test_helper.createVisaCard();
    const visa_token = visa_source.id;

    const customer = await stripeApi.createCustomer(visa_token, userId);

    const account = await stripeTestUtils.createCustomAccount(SharedGroupId);
    const accountId = account.id;
    
    await stripeApi.createProduct2("unit_test_cancel", "hello", SharedGroupId, accountId);
    const plan = await stripeApi.createPlan2(SharedGroupId, 5000, "jpy", accountId);

    const customerToken = await stripeApi.createCustomerToken(customer.id, accountId);
    const sharedCustomer = await stripeApi.createSharedCustomer("test cancel subscription", SharedGroupId, userId, email, customerToken.id, accountId);

    const tax = await stripeApi.createTex(accountId);
    const subscription = await stripeApi.createSubscription2(userId, sharedCustomer.id,  SharedGroupId, plan.id, accountId, tax.id);
    subscription.object.should.equal('subscription');

    const cancelResponse = await stripeApi.cancelSubscription2(subscription.id, accountId); 
    cancelResponse.cancel_at_period_end.should.equal(true)

    const cencelCancelResponse = await stripeApi.cancelSubscription2(subscription.id, accountId, false); 
    cencelCancelResponse.cancel_at_period_end.should.equal(false)
    
  });  

  it('custom account', async function() {
    this.timeout(10000);
    const groupId = UUID();
    const customAccountResponse = await stripeApi.createCustomAccount(groupId); 

    customAccountResponse.charges_enabled.should.equal(false);
    customAccountResponse.country.should.equal('JP');
    customAccountResponse.created.should.to.be.a("number");
    customAccountResponse.default_currency.should.equal('jpy');
    customAccountResponse.id.should.to.be.a("string");
    customAccountResponse.metadata.groupId.should.equal(groupId);
    customAccountResponse.object.should.equal('account');
    customAccountResponse.payouts_enabled.should.equal(false);
    customAccountResponse.requirements.should.is.a("object");
    customAccountResponse.type.should.equal('custom');
  });  

  it('listPaymentIntents', async function() {
    this.timeout(10000);

    const account = await stripeTestUtils.createCustomAccount(groupId);
    const accountId = account.id;
    const res = await stripeApi.listPaymentIntents(accountId);
    res.data.length.should.equal(0);
  });
})
