import * as merge from 'deepmerge';

// ids
export const getProductId = (groupId) => {
  return "prod_" + groupId;
}

export const getPlanId = (groupId, amount, currency) => {
  return ["plan", groupId, String(amount), currency].join("_");
}

export const getCustomerId = (userId) => {
  return "cus_" + userId;
}
export const getUSerIdFromCustomerId = (customerId) => {
  if (customerId.startsWith("cus_")) {
    return customerId.slice(4);
  } else {
    return customerId;
  }
}
 
export const convCustomerData = (stripeCustomerData) => {
  const {sources:{data}} = stripeCustomerData;
  return (data || []).map((source) => {
    const { brand, country, exp_month, exp_year, funding, last4 } = source;
    return { brand, country, exp_month, exp_year, funding, last4 };
  });
}

const convPlanData = (planData) => {
  const {active, amount, currency, id, interval, interval_count} = planData;
  return {active, amount, currency, id, interval, interval_count};
}
const convProductionData = (productionData) => {
  const {active, id, name, statement_descriptor, type} = productionData;
  return {active, id, name, statement_descriptor, type};
}

export const convProductData = (stripeProductData) => {
  const {plans, production} = stripeProductData; 
  const ret = {
    plans: Object.keys(plans || {}).map((key) => {
      return convPlanData(plans[key]);
    }),
    production: convProductionData(production),
  };
  return ret;
}

export const convSubscriptionData = (stripeSubscriptionData) => {
  const {
    object, billing, created,
    current_period_end, current_period_start,
    cancel_at, cancel_at_period_end, canceled_at,
    plan, quantity, start, start_date, status,
    tax_percent, trial_end, trial_start
  } = stripeSubscriptionData;

  return {
    object, billing, created,
    current_period_end, current_period_start,
    cancel_at, cancel_at_period_end, canceled_at,
    plan: convPlanData(plan), quantity, start, start_date, status,
    tax_percent, trial_end, trial_start
  }
}

export const convCustomAccountData = (customAccountData) => {
  const {id, object, country, created, default_currency, metadata, requirements, type} = customAccountData;
  return {id, object, country, created, default_currency, metadata, requirements, type};
}

// stripe log
export const stripeActions = {
  customerCreated: 1,
  productCreated: 100,
  planCreated: 200,

  subscriptionCreated: 301,
  subscriptionUpdated: 302,
  subscriptionCanceled: 303,
  subscriptionCanceledCancel: 304,
  subscriptionInvoiceByApi: 305,
  
  subscriptionResign: 310,
  subscriptionResignForce: 311,
  subscriptionDeletedByApi: 312,

}

const storeLog = async (db, userId, payload) => {
  payload.created = new Date();
  await db.collection(`/stripelog`).add(payload);
  await db.collection(`/users/${userId}/billings`).add(payload);
}

export const stripeLog = async (db, userId, data, action) => {
  const payload = { data: merge(data, {userId}), action }
  await storeLog(db, userId, payload);
}
export const billingLog = async (db, userId, groupId, subscription, action) => {
  const payload = { data: {userId, groupId, subscription} };
  await storeLog(db, userId, payload);
}

export const callbackLog = async (db, userId, groupId, action, log) => {
  const payload = { data: {log, userId, groupId}, action };
  await storeLog(db, userId, payload);
  // console.log(JSON.stringify(log, undefined, 1));
}

