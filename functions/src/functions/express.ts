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
  const {userId, groupId } = object.metadata;
  // console.log(userId, groupId);
 
  // then all subcollection and privilege will remove by trigger
  await db.doc(`/groups/${groupId}/members/${userId}`).delete();

  // delete subscription data from /users/${userId}/private/stripe
  const privateRef = await db.doc(`/users/${userId}/private/stripe`).get();
  if (privateRef) {
    const privateData = privateRef.data();
    if (privateData && privateData.subscription) {
      delete privateData.subscription[groupId];
      await db.doc(`/users/${userId}/private/stripe`).set(privateData);
    }
  }
  
  // log
  await stripeUtils.callbackLog(db, userId, groupId, stripeUtils.stripeActions.subscriptionDeletedByApi, event);
}

// nothing infomation
export const charge_succeeded = async (event) => {
  const {data:{object}} = event;
  const userId = stripeUtils.getUSerIdFromCustomerId(object.customer);
  
  // just record
  await stripeUtils.callbackLog(db, userId, null, stripeUtils.stripeActions.subscriptionUpdated, event);
}

export const invoice_payment_succeeded = async (event) => {
  const {data:{object}} = event;
  const {userId, groupId } = object.lines.data[0].metadata;
  // console.log(userId, groupId, object);

  // store invoice in  user
  const id = [String(event.created), event.id].join("_")
  
  await db.doc(`/users/${userId}/private/stripe/invoice/${id}`).set({
    groupId,
    invoiceUrl: object.invoice_pdf,
    created: object.created,
  });
  
  // update period in group
  await db.doc(`/groups/${groupId}/members/${userId}/private/stripe`).set({
    period: {
      end: object.period_end,
    }
  }, {merge:true});
  
  
  await stripeUtils.callbackLog(db, userId, groupId, stripeUtils.stripeActions.subscriptionInvoiceByApi, event);
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

const ogpPage = async (req:any, res:any) =>{
  const { groupName } = req.params;
  const snapshot = await db.doc(`groupNames/${groupName}`).get();
  const data = snapshot.data() || {};
  const groupId = data.groupId;
  if (!groupId) {
    res.json({result: false});
  }
  const group = (await db.doc(`groups/${groupId}`).get()).data() || {};
  res.json({name: groupName, title:group.title});
};

router.get('/hello',
           logger,
           hello_response);

router.post('/stripe',
            logger,
            stripe_parser);

app.use('/1.0', router);

app.get('/s/:groupName', ogpPage);
app.get('/s/:groupName/*', ogpPage);