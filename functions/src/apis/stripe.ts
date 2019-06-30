import * as Stripe from "stripe"
import * as functions from 'firebase-functions';
import * as stripeUtils from "../utils/stripe"

let stripe;

export const getStripe = () => {
  if (!stripe) {
    const secret = functions.config() && functions.config().stripe &&  functions.config().stripe.secret_key;
    stripe = new Stripe(secret)
  }
  return stripe;
}

const getExistProduct = async (id) => {
  try {
    const existProduct = await getStripe().products.retrieve(id);
    return existProduct;
  } catch (e) {
    return null
  }
}

const getExistPlan = async (id) => {
  try {
    const existPlan = await getStripe().plans.retrieve(id);
    return existPlan;
  } catch (e) {
    return null
  }
}

const getExistCustomer = async (id) => {
  try {
    const existCustomer = await getStripe().customers.retrieve(id);
    return existCustomer;
  } catch (e) {
    return null
  }
}

export const createProduct = async (name, description, groupId) => {
  const productId = stripeUtils.getProductId(groupId);
  let product = await getExistProduct(productId);
  
  if (!product) {
    product = await getStripe().products.create({
      id: productId,
      name: name,
      type: 'service',
      metadata: {
        groupId: groupId,
      },
      statement_descriptor: description
    });
  }
  return product;
  
}

export const createPlan = async(groupId, amount, currency = "jpy") => {
  const productId = "prod_" + groupId;
  const planId = stripeUtils.getPlanId(groupId, amount, currency);

  let plan = await getExistPlan(planId);
  if (!plan) {
    plan = await getStripe().plans.create({
      id: planId,
      amount: amount,
      interval: "month",
      product: productId,
      currency: currency,
    });
  }
  return plan;
};

export const createCustomer = async (token, userId) => {
  const newToken = await getStripe().tokens.retrieve(token);
  if (!newToken || !newToken.card) {
    return false;
  }

  const customerId = stripeUtils.getCustomerId(userId);
  let customer = await getExistCustomer(customerId)

  if (!customer) {
    customer = await getStripe().customers.create({
      id: customerId,
      description: 'test',
      source: token
    });
    return customer
  }

  customer = await getStripe().customers.update(customerId, {
    source: token
  });
  return customer;
  
}


export const deleteCustomer = async (userId) => {
  const customerId = stripeUtils.getCustomerId(userId);
  try {
    await getStripe().customers.del(customerId);
    return true;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export const createSubscription = async (userId, plan) => {
  const customerId = stripeUtils.getCustomerId(userId);
  const idempotency_key = ["sub", customerId, plan].join("_")
  try {
    const subscription = await getStripe().subscriptions.create({
      customer: customerId,
      items: [{ plan: plan }]
    }, {idempotency_key: idempotency_key})
    return subscription;
  } catch (e) {
    console.log(e);
    return false;
  }
}