// ids
export const getProductId = (groupId) => {
  return "prod_" + groupId;
}

export const getPlanId = (groupId, amount, currency) => {
  return ["plan", groupId, String(amount), currency].join("_");
}

export const getCustomerId = (customerId) => {
  return "cus_" + customerId;
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
    plan, quantity, start, start_date, status,
    tax_percent, trial_end, trial_start
  } = stripeSubscriptionData;

  return {
    object, billing, created,
    current_period_end, current_period_start,
    plan: convPlanData(plan), quantity, start, start_date, status,
    tax_percent, trial_end, trial_start
  }
  
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

  subscriptionResign: 310,
  subscriptionResignForce: 311,
}

export const billingLog = async (db, userId, groupId, subscription, action) => {
  await db.collection(`/stripelog`).add({ userId, groupId, subscription, action, created: new Date() });
  await db.collection(`/users/${userId}/billings`).add({subscription, action, created: new Date()});
}

export const callbackLog = async (db, log) => {
  await db.collection(`/stripelog`).add({ log });
}