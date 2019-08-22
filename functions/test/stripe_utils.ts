import * as stripeCustomAccountData from './testData/stripeCustomAccountData'
import * as stripeApi from '../src/apis/stripe';

export const createCustomAccount = async (groupId) => {
  const business_type = "individual";
  const customAccountResponse = await stripeApi.createCustomAccount(groupId, "JP", "individual"); 

  const date = Math.round(Date.now()  / 1000);
  const ip = "123.123.123.123";
  const postData = {
    business_type,
    individual: stripeCustomAccountData.postData["individual"],
    tos_acceptance: {
      date,
      ip,
    },
  }

  await stripeApi.updateCustomAccount(customAccountResponse.id, postData);
  return customAccountResponse;
}
