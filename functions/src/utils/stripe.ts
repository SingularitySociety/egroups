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
      const {active, amount, currency, id, interval, interval_count} = plans[key];
      return {active, amount, currency, id, interval, interval_count};
    }),
    production: ((pr) => {
      const {active, id, name, statement_descriptor, type} = pr;
      return {active, id, name, statement_descriptor, type};
    })(production)
  };
 
  return ret;
}
