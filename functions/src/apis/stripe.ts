import * as Stripe from "stripe"
import * as functions from 'firebase-functions';
import * as stripeUtils from "../utils/stripe"

let stripe;

export const getStripe = () => {
  if (!stripe) {
    const secret = functions.config() && functions.config().stripe &&  functions.config().stripe.secret_key || process.env.STRIPE_SECRET;
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
      metadata: {
        groupId: groupId,
      },
    });
  }
  return plan;
};

export const createPlan2 = async(groupId, amount, currency = "jpy", accoundId) => {
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
      metadata: {
        groupId: groupId,
      },
    }, {
      stripe_account: accoundId
    });
  }
  return plan;
};

export const createProduct2 = async (name, description, groupId, accountId) => {
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
    }, {
      stripe_account: accountId
    });
  }
  return product;
  
}

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
      source: token,
      metadata: {
        userId,
      },
    });
    return customer
  }

  customer = await getStripe().customers.update(customerId, {
    source: token
  });
  return customer;
  
}

export const createSharedCustomer = async(groupId, userId, source, accountId) => {
  const customerId = stripeUtils.getSharedCustomerId(groupId, userId);
  const customer = await getStripe().customers.create({
    id: customerId,
    name: "",
    description: "Shared customer",
    source: source,
    metadata: {
      userId,
    },
  }, {
    stripe_account: accountId,
  });
  return customer;
}

export const createCustomerToken = async (customerId, accountId) => {
  const token = await getStripe().tokens.create({
    customer: customerId,
  }, {
    stripe_account: accountId,
  });
  return token;
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

export const createSubscription = async (userId, groupId, plan) => {
  const customerId = stripeUtils.getCustomerId(userId);
  const idempotency_key = ["sub", customerId, plan].join("_")
  try {
    const subscription = await getStripe().subscriptions.create({
      customer: customerId,
      items: [{ plan: plan }],
      // todo tax_rate
      default_tax_rates: ["txr_1EpqXRJRcJsJLSj692uXxIcK"],
      metadata: {
        userId,
        groupId,
      },
    }, {idempotency_key: idempotency_key})
    return subscription;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export const createSubscription2 = async (userId, customerId, groupId, plan, accoundId, taxId) => {
  const idempotency_key = ["sub", customerId, plan].join("_")
  try {
    const subscription = await getStripe().subscriptions.create({
      customer: customerId,
      items: [{ plan: plan }],
      default_tax_rates: [taxId],
      metadata: {
        userId,
        groupId,
      },
      application_fee_percent: 10,
    }, {
      idempotency_key: idempotency_key,
      stripe_account: accoundId
    })
    return subscription;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export const cancelSubscription = async (subscriptionId, cancel=true) => {
  try {
    const subscription = await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancel,
    })
    return  subscription;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export const cancelSubscription2 = async (subscriptionId, accountId, cancel=true) => {
  try {
    const subscription = await getStripe().subscriptions.update(subscriptionId, {
      cancel_at_period_end: cancel,
    }, {
      stripe_account: accountId,
    })
    return  subscription;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export const retrieveSubscription = async (subscriptionId) => {
  try {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId)
    return  subscription;
  } catch (e) {
    console.log(e);
    return false;
  }
}

export const retrieveSubscription2 = async (subscriptionId, accountId) => {
  try {
    const subscription = await getStripe().subscriptions.retrieve(subscriptionId, {
      stripe_account: accountId,
    })
    return  subscription;
  } catch (e) {
    console.log(e);
    return false;
  }
}
     
export const createCustomAccount = async (groupId, country="JP", business_type="") => {
  const options: any = {
    type: "custom",
    country,
    metadata: {
      groupId,
    },
  };
  if (business_type && business_type !== "") {
    options.business_type = business_type;
  }
  if (country === "US") {
    // options.requested_capabilities = ["platform_payments"];
    options.requested_capabilities = ["card_payments"];
  }
  const account =  await getStripe().accounts.create(options);
  return account;
}

export const updateCustomAccount = async(accountId, data) => {
  const account =  await getStripe().accounts.update(accountId, data);
  return account;
}

export const getCustomAccount = async(accountId) => {
  const account =  await getStripe().accounts.retrieve(accountId);
  return account;
}

export const createPerson = async (accoundId, data) => {
  const person = await getStripe().accounts.createPerson(accoundId, data);
  return person;
}

export const updatePerson = async (accoundId, personId, data) => {
  const person = await getStripe().accounts.updatePerson(accoundId, personId, data);
  return person;
}

export const listPersons =  async (accoundId) => {
  const lists = await getStripe().accounts.listPersons(accoundId);
  return lists;
}

export const createTex = async (accoundId) => {
  const tax = await getStripe().taxRates.create({
    display_name: '消費税',
    description: '消費税',
    jurisdiction: 'JA',
    percentage: 10.0,
    inclusive: false,
  }, {
    stripe_account: accoundId
  });
  return tax;
}