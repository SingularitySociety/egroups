import * as functions_test_helper from "./functions_test_helper";
import * as stripeUtils from "../src/utils/stripe"

import { should } from 'chai';
import * as UUID from "uuid-v4";


const {index, admin_db, test} = functions_test_helper.initFunctionsTest();

should()

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

});
