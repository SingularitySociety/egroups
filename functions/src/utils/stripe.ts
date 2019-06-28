export const convCustomerData = (stripeCustomerData) => {
  if (stripeCustomerData && stripeCustomerData.sources && stripeCustomerData.sources.data) {
    return stripeCustomerData.sources.data.map((source) => {
      const { brand, country, exp_month, exp_year, funding, last4 } = source;
      return { brand, country, exp_month, exp_year, funding, last4 };
    });
  }
  return [];
}
