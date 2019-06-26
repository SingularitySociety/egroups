import * as Stripe from "stripe"
import * as functions from 'firebase-functions';

let stripe;

const getStripe = () => {
  if (!stripe) {
    const secret = functions.config() && functions.config().stripe &&  functions.config().stripe.secret_key;
    stripe = new Stripe(secret)
  }
  return stripe;
}

const getExistProduct = async (id) => {
  try {
    const exist_product = await getStripe().products.retrieve(id);
    return exist_product;
  } catch (e) {
    return null
  }
}

const getExistPlan = async (id) => {
  try {
    const exist_plan = await getStripe().plans.retrieve(id);
    return exist_plan;
  } catch (e) {
    return null
  }
}

export const getProductId = (groupId) => {
  return "prod_" + groupId;
}

export const getPlanId = (groupId, amount) => {
  return ["plan", groupId, String(amount)].join("_");
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
  // todo insert to firestore
  
  return product;
  
}

export const createPlan = async(groupId, amount) => {
  const productId = "prod_" + groupId;
  const planId = getPlanId(groupId, amount);

  let plan = await getExistPlan(planId);
  if (!plan) {
    plan = await getStripe().plans.create({
      id: planId,
      amount: amount,
      interval: "month",
      product: productId,
      currency: "jpy",
    });
  }
  // todo insert to firestore
  
  
  return plan;
};
