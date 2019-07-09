import * as merge from 'deepmerge';

import * as stripeUtils from '../utils/stripe';
import * as utils from '../utils/utils'

import * as stripeApi from '../apis/stripe';

import Privileges from "../../react-lib/src/const/Privileges.js";

const updateSubscriptionData = async (db, groupId, userId, subscription, period) => {
  // raw data
  await db.doc(`/groups/${groupId}/members/${userId}/secret/stripe`).set({subscription: subscription});
  await db.doc(`/groups/${groupId}/members/${userId}/private/stripe`).set({
    subscription: stripeUtils.convSubscriptionData(subscription),
    period: period,
  });
  await db.doc(`users/${userId}/private/stripe`).set({
    subscription: {
      [groupId]: stripeUtils.convSubscriptionData(subscription),
    }
  }, {merge:true});
}

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
  const customer = await stripeApi.createCustomer(token, userId);
  
  (await db.doc(`users/${userId}/secret/stripe`).set({
    customer: customer,
  }, {merge:true}));

  (await db.doc(`users/${userId}/private/stripe`).set({
    customer: stripeUtils.convCustomerData(customer),
  }, {merge:true}));

  await stripeUtils.stripeLog(db, userId, {customer}, stripeUtils.stripeActions.customerCreated);
  
  return {
    customer: customer,
    result: true,
  };
}

export const createSubscription = async (db, data, context) => {
  // plan = {price, currency}
  if (!context.auth || !context.auth.uid) {
    console.log("createSubscription error: no authentication info")
    return {result: false, message:"invalid request"};
  }
  if (!data || !data.groupId || !data.plan || !data.plan.price || !data.plan.currency) {
    console.log("createSubscription error: request parameter missing")
    return {result: false, message:"invalid request"};
  }
  
  const userId = context.auth.uid;
  const {groupId, plan, displayName} = data;
  const {price, currency} = plan;
  const plan_key = [String(price), currency].join("_")
  
  const user = (await db.doc(`users/${userId}`).get());
  if (!user.exists) {
    console.log("createSubscription error: user not exists")
    return {result: false, message:"invalid request"};
  }

  // check group
  const group = await db.doc(`groups/${groupId}`).get();
  if (!group.exists) {
    console.log("createSubscription error: group not exists")
    return {result: false, message:"invalid request"};
  }
  
  // check plan
  const stripeGroup = await db.doc(`/groups/${groupId}/secret/stripe`).get(); 

  if (!stripeGroup.exists) {
    console.log("createSubscription error: stripe secret not exists")
    return {result: false, message:"invalid request"};
  }
  const stripeGroupSecretData = stripeGroup.data();
  if (!stripeGroupSecretData || !stripeGroupSecretData.plans || !stripeGroupSecretData.plans[plan_key]) {
    console.log("createSubscription error: stripe secret data not exists")
    return {result: false, message:"invalid request"};
  }

  // check not subscription member yet.
  const privileges = await db.doc(`groups/${groupId}/privileges/${userId}`).get();
  if (privileges.exists && privileges.data().value && privileges.data().value >= Privileges.subscriber) {
    console.log("createSubscription error: already member")
    return {result: false, message:"invalid request"};
  }

  // everything ok
  const planId = stripeUtils.getPlanId(groupId, price, currency);
  const subscription = await stripeApi.createSubscription(userId, groupId, planId);

  if (!subscription) {
    console.log("createSubscription error: subscription creation failed")
    return {result: false, message:"invalid request"};
  }

  const period = {
    start: subscription.current_period_end,
    end: subscription.current_period_start,
  };
  
  await updateSubscriptionData(db, groupId, userId, subscription, period);
  await db.doc(`/groups/${groupId}/members/${userId}`).set({
    created: new Date(),
    displayName: displayName || "---",
    userId: userId,
    groupId: groupId,
  });
  
  await stripeUtils.billingLog(db, userId, groupId, subscription, stripeUtils.stripeActions.subscriptionCreated);
  
  return {result: true};
}

// create production and plan
export const groupDidUpdate = async (db, change, context) => {
  const { groupId } = context.params;
  const after = change.after.exists ? change.after.data() ||{} : {};
  if (after.subscription) {
    const userId = after.owner;
    const stripeRef = db.doc(`/groups/${groupId}/secret/stripe`);
    const stripeData = (await stripeRef.get()).data();
    if (!stripeData || !stripeData.production) {
      const production = await stripeApi.createProduct(after.groupName, after.groupName, groupId);
      await stripeRef.set({production: production}, {merge:true});
      await stripeUtils.stripeLog(db, userId, {production}, stripeUtils.stripeActions.productCreated);
    }
    
    if (after.plans) {
      const existPlans = (stripeData && stripeData.plans) || {};
      const newPlans = {};
      await utils.asyncForEach(after.plans, async(plan) => {
        // todo validate plan
        const price = plan.price;
        const currency = plan.currency || "jpy";
        const key = [String(price), currency].join("_")
        if (!stripeData || !stripeData.plans || !stripeData.plans[key]) {
          const stripePlan = await stripeApi.createPlan(groupId, price, currency);
          newPlans[key] = stripePlan;
          await stripeUtils.stripeLog(db, userId, {plan}, stripeUtils.stripeActions.planCreated);
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

export const cancelSubscription = async (db, data, context) => {
  // plan = {price, currency}

  if (!context.auth || !context.auth.uid) {
    return {result: false};
  }
  if (!data || !data.groupId || !data.subscriptionId) {
    return {result: false};
  }
  const userId = context.auth.uid;
  const {groupId} = data;

  const secret = (await db.doc(`/groups/${groupId}/members/${userId}/secret/stripe`).get()).data();
  
  if (!secret) {
    return {result: false};
  }
  const subscriptionId = data.subscriptionId;
  const cancel = data.cancel === undefined ? true : data.cancel;
  
  const subscription = await stripeApi.cancelSubscription(subscriptionId, cancel);

  const period = {
    end: subscription.current_period_start,
  };
  await updateSubscriptionData(db, groupId, userId, subscription, period);

  return {result: true};
  
}
