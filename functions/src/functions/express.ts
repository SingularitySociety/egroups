import * as express from 'express';
import * as functions from 'firebase-functions';

export const app = express();
export const router = express.Router();
import * as stripeApi from '../apis/stripe';

export const logger = async (req, res, next) => {
  next();
}
export const hello_response = async (req, res) =>{
  res.json({message: "hello"});
};

const customer_subscription_deleted = (data) => {
  if (data && data.items && data.items.data) {
    data.items.data.forEach((item) => {
      console.log(item.subscription);
    });
  }
  console.log(JSON.stringify(data, undefined, 1));
}
const charge_succeeded = (data) => {
  console.log(data);
}

export const stripe_parser = async (req, res) => {
  const stripe = stripeApi.getStripe();
  const endpointSecret = process.env.STRIPE_ENDPOINT_SECRET || functions.config() && functions.config().stripe && functions.config().stripe.endpoint_secret;
  
  const sig = req.headers['stripe-signature'];
  try {
    const event = stripe.webhooks.constructEvent(req.rawBody.toString(), sig, endpointSecret);
    console.log(event);
    console.log("OK");

    const {data:{object}} = event
    if (!event) {
      return res.status(400).send(`Webhook Error: unknow error`);
    }
    
    if (event.type === "customer.subscription.deleted") {
      customer_subscription_deleted(object)
    } else if (event.type === "charge.succeeded") {
      charge_succeeded(object);
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
