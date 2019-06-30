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

const convPlanData = (planData) => {
  const {active, amount, currency, id, interval, interval_count} = planData;
  return {active, amount, currency, id, interval, interval_count};
}
const convProductionData = (productionData) => {
  const {active, id, name, statement_descriptor, type} = productionData;
  return {active, id, name, statement_descriptor, type};
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
