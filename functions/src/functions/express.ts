import * as express from 'express';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';

export const app = express();
export const router = express.Router();
import * as stripeApi from '../apis/stripe';
import * as stripeUtils from '../utils/stripe';

// for test, db is not immutable
if (!admin.apps.length) {
  admin.initializeApp();
}

let db = admin.firestore();
export const updateDb = (_db) => {
  db = _db;
}

export const logger = async (req, res, next) => {
  next();
}
export const hello_response = async (req, res) =>{
  res.json({message: "hello"});
};

export const customer_subscription_deleted = async (event) => {
  const {data:{object}} = event;
  if (object && object.items && object.items.data) {
    object.items.data.forEach((item) => {
      console.log(item.subscription);
    });
  }
  await stripeUtils.callbackLog(db, event);
}
export const charge_succeeded = async (event) => {
  // const {data:{object}} = event;
  await stripeUtils.callbackLog(db, event);
}

export const invoice_payment_succeeded = async (event) => {
  // const {data:{object}} = event;
  await stripeUtils.callbackLog(db, event);
}

export const stripe_parser = async (req, res) => {
  const stripe = stripeApi.getStripe();
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET || functions.config() && functions.config().stripe && functions.config().stripe.endpoint_secret;
  
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody.toString(), sig, endpointSecret);

    // const {data:{object}} = event
    if (!event) {
      return res.status(400).send(`Webhook Error: unknow error`);
    }
    
    if (event.type === "customer.subscription.deleted") {
      await customer_subscription_deleted(event)
    } else if (event.type === "charge.succeeded") {
      await charge_succeeded(event);
    } else if (event.type === "invoice.payment_succeeded") {
      await invoice_payment_succeeded(event);
    }
    res.json({});
  } catch (err) {
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
};

router.get('/hello',
           logger,
           hello_response);

router.post('/stripe',
            logger,
            stripe_parser);

app.use('/1.0', router);
