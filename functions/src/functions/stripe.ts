import * as merge from 'deepmerge';

import * as stripeUtils from '../utils/stripe';
import * as utils from '../utils/utils'

import * as stripe from '../apis/stripe';

export const createCustomer = async (db, data, context) => {
  if (!context.auth || !context.auth.uid) {
    return {result: false};
  }
  if (!data || !data.token) {
    return {result: false};
  }
  const userId = context.auth.uid;
  const token = data.token;

  const user = (await db.doc(`users/${userId}`).get());
  if (!user.exists) {
    return {result: false};
  }
  const customer = await stripe.createCustomer(token, userId);
  
  (await db.doc(`users/${userId}/secret/stripe`).set({
    customer: customer,
  }, {merge:true}));

  (await db.doc(`users/${userId}/private/stripe`).set({
    customer: stripeUtils.convCustomerData(customer),
  }, {merge:true}));
  
  return {
    customer: customer,
    result: true,
  };
}

export const createSubscribe = async (db, data, context) => {
  if (!context.auth || !context.auth.uid) {
    return {result: false};
  }
  if (!data || !data.groupId || !data.plan) {
    return {result: false};
  }
  const userId = context.auth.uid;
  const {groupId, plan} = data;
  
  const user = (await db.doc(`users/${userId}`).get());
  if (!user.exists) {
    return {result: false};
  }
  console.log(userId, groupId, plan)
  // get group
  // TBD
  return {result: true};
}


export const groupDidUpdate = async (db, change, context) => {
  const { groupId } = context.params;
  const after = change.after.exists ? change.after.data() ||{} : {};
  if (after.subscription) {
    const stripeRef = db.doc(`/groups/${groupId}/secret/stripe`);
    const stripeData = (await stripeRef.get()).data();
    if (!stripeData || !stripeData.production) {
      const production = await stripe.createProduct(after.groupName, after.groupName, groupId);
      await stripeRef.set({production: production}, {merge:true});
    }
    
    if (after.plans) {
      const existPlans = (stripeData && stripeData.plans) || {};
      const newPlans = {};
      await utils.asyncForEach(after.plans, async(plan) => {
        // todp validate plan
        const price = plan.price;
        const currency = plan.currency || "jpy";
        const key = [String(price), currency].join("_")
        if (stripeData && (!stripeData.plans || !stripeData.plans[key])) {
          const stripePlan = await stripe.createPlan(groupId, price, currency);
          newPlans[key] = stripePlan;
        }
      });
      if (Object.keys(newPlans).length > 0) {
        const updatedPlan = merge(existPlans, newPlans);
        await stripeRef.set({plans: updatedPlan}, {merge:true});
      }
    }
    const secretData = await stripeRef.get();
    if (secretData.exists) {
      const privateData = stripeUtils.convProductData(secretData.data());
      await db.doc(`/groups/${groupId}/private/stripe`).set(privateData, {merge:true});
    }
    // const value = snapshot.data();
  }
}