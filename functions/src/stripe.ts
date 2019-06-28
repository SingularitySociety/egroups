import * as Stripe from "stripe"
import * as functions from 'firebase-functions';

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


export const createProduct = async (name, description, groupId) => {
  const productId = getProductId(groupId);
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
  const planId = getPlanId(groupId, amount, currency);

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

  const customerId = getCustomerId(userId);
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


export const deleteCustomer  = async (userId) => {
  const customerId = getCustomerId(userId);
  try {
    await getStripe().customers.del(customerId);
    return true;
  } catch (e) {
    return false;
  }
}