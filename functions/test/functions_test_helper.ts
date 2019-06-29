import * as stripe from '../src/apis/stripe';

export const createVisaCard = async () => {
  const stripeInstance = stripe.getStripe()
  const visa_source = await stripeInstance.tokens.create({
    card: {
      number: '4242424242424242',
      exp_month: 8,
      exp_year: 2025,
    },
  });
  return visa_source;
}

export const createMasterCard = async () => {
  const stripeInstance = stripe.getStripe()
  const master_source = await stripeInstance.tokens.create({
    card: {
      number: '5555555555554444',
      exp_month: 8,
      exp_year: 2025,
    },
  });
  return master_source;
}
