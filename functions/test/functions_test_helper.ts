import * as test_helper from "../../lib/test/rules/test_helper";
import * as index from '../src/index';
import * as Test from 'firebase-functions-test';
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

export const createExpiredCard = async () => {
  const stripeInstance = stripe.getStripe()
  const master_source = await stripeInstance.tokens.create({
    card: {
      number: '4000000000000069',
      exp_month: 8,
      exp_year: 2025,
    },
  });
  return master_source;
}

export const initFunctionsTest = () => {
  const admin_db = test_helper.adminDB();
  index.updateDb(admin_db);

  const test = Test();
  test.mockConfig({ stripe: { secret_key: process.env.STRIPE_SECRET }});
  return {index, admin_db, test};
}

