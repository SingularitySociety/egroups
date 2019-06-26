//import * as supertest from 'supertest';
import * as stripe from '../src/stripe';
import { should } from 'chai';
// import * as utils from '../src/utils'

should()

const groupId = "unit_test_plan";

describe('Stripe test', () => {
  it ('id test', () => {
    stripe.getProductId(groupId).should.equal("prod_unit_test_plan");
    stripe.getPlanId(groupId, 5000).should.equal("plan_unit_test_plan_5000");
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
    
    const plan = await stripe.createPlan(groupId, 5000);

    plan.id.should.equal('plan_unit_test_plan_5000');
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
  });
})