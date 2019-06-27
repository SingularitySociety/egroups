//import * as supertest from 'supertest';
import * as stripe from '../src/stripe';
import { should } from 'chai';
// import * as utils from '../src/utils'

should()

const groupId = "unit_test_plan";

describe('Stripe test', () => {
  it ('id test', () => {
    stripe.getProductId(groupId).should.equal("prod_unit_test_plan");
    stripe.getPlanId(groupId, 5000, "jpy").should.equal("plan_unit_test_plan_5000_jpy");
    stripe.getPlanId(groupId, 30, "usd").should.equal("plan_unit_test_plan_30_usd");
  });

  it('hello', async () => {
    const product = await stripe.createProduct("unit_test", "hello", groupId);
    product.id.should.equal(stripe.getProductId(groupId));
    
    product.object.should.equal('product');
    product.active.should.equal(true);
    product.metadata.should.deep.equal({ groupId: 'unit_test_plan' });
    product.name.should.equal('unit_test');
    product.statement_descriptor.should.equal('hello');
    product.type.should.equal('service');
    
    const plan = await stripe.createPlan(groupId, 5000, "jpy");

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

    const plan_usd = await stripe.createPlan(groupId, 30, "usd");

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

})