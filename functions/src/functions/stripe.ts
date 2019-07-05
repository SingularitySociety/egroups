import * as merge from 'deepmerge';

import * as stripeUtils from '../utils/stripe';
import * as utils from '../utils/utils'

import * as stripe from '../apis/stripe';

import Privileges from "../../react-lib/src/const/Privileges.js";

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
  // plan = {price, currency}
  if (!context.auth || !context.auth.uid) {
    return {result: false};
  }
  if (!data || !data.groupId || !data.plan || !data.plan.price || !data.plan.currency) {
    return {result: false};
  }
  
  const userId = context.auth.uid;
  const {groupId, plan, displayName} = data;
  const {price, currency} = plan;
  const plan_key = [String(price), currency].join("_")
  
  const user = (await db.doc(`users/${userId}`).get());
  if (!user.exists) {
    return {result: false};
  }

  // check group
  const group = await db.doc(`groups/${groupId}`).get();
  if (!group.exists) {
    return {result: false};
  }
  
  // check plan
  const stripeGroup = await db.doc(`/groups/${groupId}/secret/stripe`).get(); 

  if (!stripeGroup.exists) {
    return {result: false};
  }
  const stripeGroupSecretData = stripeGroup.data();
  if (!stripeGroupSecretData || !stripeGroupSecretData.plans || !stripeGroupSecretData.plans[plan_key]) {
    return {result: false};
  }

  // check not subscription member yet.
  const privileges = await db.doc(`groups/{groupId}/privileges/${userId}`).get();
  if (privileges.exists && privileges.data().value && privileges.data().value >= Privileges.subscriber) {
    return {result: false};
  }

  // everything ok
  const planId = stripeUtils.getPlanId(groupId, price, currency);
  const subscription = await stripe.createSubscription(userId, groupId, planId);

  if (!subscription) {
    return {result: false};
  }

  // raw data
  await db.doc(`/groups/${groupId}/members/${userId}/secret/stripe`).set({subscription: subscription})

  await db.doc(`/groups/${groupId}/members/${userId}`).set({
    created: new Date(),
    displayName: displayName || "---",
    userId: userId,
    groupId: groupId,
  });

  await db.doc(`/groups/${groupId}/members/${userId}/private/stripe`).set({
    subscription: stripeUtils.convSubscriptionData(subscription),
  });

  await db.doc(`users/${userId}/private/stripe`).set({
    subscription: {
      [groupId]: stripeUtils.convSubscriptionData(subscription),
    }
  }, {merge:true});

  await stripeUtils.billingLog(db, userId, groupId, subscription, stripeUtils.stripeActions.subscriptionCreated);
  
  return {result: true};
}

// create production and plan
export const groupDidUpdate = async (db, change, context) => {
  const { groupId } = context.params;
  const after = change.after.exists ? change.after.data() ||{} : {};
  if (after.subscription) {
    const stripeRef = db.doc(`/groups/${groupId}/secret/stripe`);
    const stripeData = (await stripeRef.get()).data();
    if (!stripeData || !stripeData.production) {
      const production = await stripe.createProduct(after.groupName, after.groupName, groupId);
      await stripeRef.set({production: production}, {merge:true});
      // todo create Product log
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
          // todo create Plan log
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

