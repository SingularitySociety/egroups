import * as merge from 'deepmerge';

import * as stripeUtils from '../utils/stripe';
import * as utils from '../utils/utils'

import * as stripeApi from '../apis/stripe';
import * as logger from '../utils/logger';

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
  const error_handler = logger.error_response_handler({func: "createCustomer", message: "invalid request"});

  if (!context.auth || !context.auth.uid) {
    return error_handler({error_type: logger.ErrorTypes.NoUid});
  }
  if (!data || !data.token) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  const userId = context.auth.uid;
  const token = data.token;

  const user = (await db.doc(`users/${userId}`).get());
  if (!user.exists) {
    return error_handler({error_type: logger.ErrorTypes.NoUser});
  }
  const customer = await stripeApi.createCustomer(token, userId);
  if (!customer) {
    return error_handler({error_type: logger.ErrorTypes.StripeApi});
  }
  
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
  const error_handler = logger.error_response_handler({func: "createSubscription", message: "invalid request"});
  
  if (!context.auth || !context.auth.uid) {
    return error_handler({error_type: logger.ErrorTypes.NoUid});
  }
  if (!data || !data.groupId || !data.plan || !data.plan.price || !data.plan.currency || !data.onetimetoken) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }

  const userId = context.auth.uid;
  
  const onetime = (await db.doc(`/users/${userId}/secret/onetime`).get()).data()

  if (!onetime || onetime.supermario.token !== data.onetimetoken || onetime.ttl > Math.round(Date.now()  / 1000) ) {
    return error_handler({
      error_type: logger.ErrorTypes.OnetimeKey,
      message: "no onetime key"
    });
  }
  
  const {groupId, plan, displayName} = data;
  const {price, currency} = plan;
  const plan_key = [String(price), currency].join("_")
  
  const user = (await db.doc(`users/${userId}`).get());
  if (!user.exists) {
    return error_handler({error_type: logger.ErrorTypes.NoUser});
  }

  // check group
  const group = await db.doc(`groups/${groupId}`).get();
  if (!group.exists) {
    return error_handler({error_type: logger.ErrorTypes.NoGroup});
  }
  
  // check plan
  const stripeGroup = await db.doc(`/groups/${groupId}/secret/stripe`).get(); 

  if (!stripeGroup.exists) {
    return error_handler({error_type: logger.ErrorTypes.NoStripeSecret});
  }
  const stripeGroupSecretData = stripeGroup.data();
  if (!stripeGroupSecretData || !stripeGroupSecretData.plans || !stripeGroupSecretData.plans[plan_key]) {
    return error_handler({error_type: logger.ErrorTypes.NoStripeSecretData});
  }

  // check not subscription member yet.
  const refMembership = db.doc(`/groups/${groupId}/members/${userId}/readonly/membership`);
  const membership = await refMembership.get();
  if (membership.exists && membership.data().privilege && membership.data().privilege >= Privileges.subscriber) {
    return error_handler({error_type: logger.ErrorTypes.AlreadyMember});
  }

  // everything ok
  const planId = stripeUtils.getPlanId(groupId, price, currency);
  const subscription = await stripeApi.createSubscription(userId, groupId, planId);

  if (!subscription) {
    return error_handler({error_type: logger.ErrorTypes.StripeSubscriptionCreation});
  }

  const period = {
    start: subscription.current_period_start,
    end: subscription.current_period_end,
  };
  
  await updateSubscriptionData(db, groupId, userId, subscription, period);
  const created = new Date();
  await refMembership.set({
    created,
    privilege: Privileges.subscriber,
  });
  await db.doc(`/groups/${groupId}/members/${userId}`).set({
    created,
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
  const error_handler = logger.error_response_handler({func: "groupDidUpdate", message: "invalid request"});

  if (after.subscription) {
    const userId = after.owner;
    const stripeRef = db.doc(`/groups/${groupId}/secret/stripe`);
    const stripeData = (await stripeRef.get()).data();
    if (!stripeData || !stripeData.production) {
      const production = await stripeApi.createProduct(after.groupName, after.groupName, groupId);
      if (!production) {
        return error_handler({error_type: logger.ErrorTypes.StripeApi});
      }
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
          if (!stripePlan) {
            return error_handler({error_type: logger.ErrorTypes.StripeApi});
          }
          newPlans[key] = stripePlan;
          await stripeUtils.stripeLog(db, userId, {plan}, stripeUtils.stripeActions.planCreated);
        }
        return true
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
  return true;
}

export const cancelSubscription = async (db, data, context) => {
  // plan = {price, currency}
  const error_handler = logger.error_response_handler({func: "cancelSubscription", message: "invalid request"});

  if (!context.auth || !context.auth.uid) {
    return error_handler({error_type: logger.ErrorTypes.NoUid});
  }
  if (!data || !data.groupId) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  const userId = context.auth.uid;
  const {groupId} = data;

  const secret = (await db.doc(`/groups/${groupId}/members/${userId}/secret/stripe`).get()).data();
  
  if (!secret || !secret.subscription) {
    return error_handler({error_type: logger.ErrorTypes.NoStripeSecret});
  }
  const subscriptionId = secret.subscription.id;
  const cancel = data.cancel === undefined ? true : data.cancel;
  
  const subscription = await stripeApi.cancelSubscription(subscriptionId, cancel);

  if (!subscription) {
    return error_handler({error_type: logger.ErrorTypes.StripeApi});
  }
  
  const period = {
    end: subscription.current_period_end,
  };
  await updateSubscriptionData(db, groupId, userId, subscription, period);

  return {result: true};
  
}

const validateCustomAccountFunc = async (error_handler, db, data, context) => {
  if (!context.auth || !context.auth.uid) {
    return [error_handler({error_type: logger.ErrorTypes.NoUid})];
  }
  if (!data || !data.groupId) {
    return [error_handler({error_type: logger.ErrorTypes.ParameterMissing})];
  }
  const groupId = data.groupId;
  const userId = context.auth.uid;
  
  const refGroup = db.doc(`groups/${groupId}`);
  const groupData = (await refGroup.get()).data();
  if (!groupData) {
    return [error_handler({error_type: logger.ErrorTypes.ParameterMissing})];
  }
  if (groupData.owner !== userId) {
    return [error_handler({error_type: logger.ErrorTypes.ParameterMissing})];
  }
  return [null, groupData];
}

const api_error_handler = (e, error_handler) => {
  if (e.type && e.type.startsWith("Stripe")) {
    return error_handler({
      // error_type: logger.ErrorTypes.StripeValidation,
      log: {
        message: "stripeValidationError",
        type: e.type,
        stripe_message: e.message,
      }
    });
  } else {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
};

export const createCustomAccount = async (db, data, context) => {
  const error_handler = logger.error_response_handler({func: "createCustomAccount", message: "invalid request"});

  const [error_response, groupData] = await validateCustomAccountFunc(error_handler, db, data, context);
  if (error_response) {
    return error_response;
  }
  if (!groupData.subscription || !data.country) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  if (data.business_type && (data.business_type !== "company" && data.business_type !== "individual")) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  const {groupId, country, business_type} = data;

  const refAccont = db.doc(`groups/${groupId}/secret/account`);
  const refAccontPrivate = db.doc(`groups/${groupId}/private/account`);

  const existAccount = await refAccont.get();
  if (existAccount.exists) {
    return error_handler({error_type: logger.ErrorTypes.AlreadyDataExists});
  }
  
  try {
    const account = await db.runTransaction(async (tr)=>{
      const account_data = await stripeApi.createCustomAccount(groupId, country, business_type);
      tr.set(refAccont, {account: account_data})
      tr.set(refAccontPrivate, {
        account: stripeUtils.convCustomAccountData(account_data)
      })
      return account_data;
    });
    return {
      result: true,
      account: stripeUtils.convCustomAccountData(account),
    }
  } catch (e) {
    return api_error_handler(e, error_handler);
  }
}

export const updateCustomAccount = async (db, data, context) => {
  const error_handler = logger.error_response_handler({func: "updateCustomAccount", message: "invalid request"});

  const [error_response] = await validateCustomAccountFunc(error_handler, db, data, context);
  if (error_response) {
    return error_response;
  }
  if (!data.business_type) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  if (!data.account_data && !data.external_account) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  
  const {groupId, business_type, account_data, personal_data, ip, external_account, business_profile} = data;

  const refAccont = db.doc(`groups/${groupId}/secret/account`);
  const refAccontPrivate = db.doc(`groups/${groupId}/private/account`);

  const existAccountData = (await refAccont.get()).data();
  if (!existAccountData) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  const accountId = existAccountData.account.id;
  const exist_business_type = existAccountData.account.business_type;
  
  if (exist_business_type && (exist_business_type !== business_type)) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  
  // https://stripe.com/docs/api/accounts/update
  let postData:any = {};
  if (business_type === "individual") {
    postData = {
      business_type,
      individual: account_data,
    }
  } else if (business_type === "company") {
    postData = {
      business_type,
      company: account_data,
    }
  } else {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  if (business_profile) {
    postData.business_profile = business_profile;
  }
  if (ip) {
    const date = Math.round(Date.now()  / 1000);
    postData.tos_acceptance = {
      date,
      ip,
    };
  }
  if (external_account) {
    postData.external_account = external_account;
  }
  
  try {
    const res: any = {};
    const privateRes: any = {};
    await stripeApi.updateCustomAccount(accountId, postData);
    
    if (business_type === "company" && personal_data) {
      const list = await stripeApi.listPersons(accountId);
      const personId = list.data[0].id;
      const personData = await stripeApi.updatePerson(accountId, personId, personal_data);
      res.person = personData;
      privateRes.person = stripeUtils.convPersonData(personData);
    }

    const accountData = await stripeApi.getCustomAccount(accountId);
    res.account = accountData;
    privateRes.account = stripeUtils.convCustomAccountData(accountData);

    await db.runTransaction(async (tr)=>{
      tr.set(refAccont, res)
      tr.set(refAccontPrivate, privateRes)
    });
    privateRes.result = true;
    return privateRes;
  } catch (e) {
    return api_error_handler(e, error_handler);
  }
};

