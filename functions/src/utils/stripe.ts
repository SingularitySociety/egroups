export const convCustomerData = (stripeCustomerData) => {
  if (stripeCustomerData && stripeCustomerData.sources && stripeCustomerData.sources.data) {
    return stripeCustomerData.sources.data.map((source) => {
      return {
        "brand": source["brand"],
        "country": source["country"],
        "exp_month": source["exp_month"],
        "exp_year": source["exp_year"],
        "funding": source["funding"],
        "last4": source["last4"],
      };
    });
  }
  return [];
}
