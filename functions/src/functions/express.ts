import * as express from 'express';
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

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


const delete_subscriber = async (groupId, userId) => {
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
}

// check update cancel
export const customer_subscription_updated = async (event) => {
  const {data:{object}} = event;
  const {userId, groupId } = object.metadata;
  console.log(userId, groupId);
  if (object.status === "incomplete_expired") {
    await delete_subscriber(groupId, userId);
  } else if (object.status === "canceled") {
    await delete_subscriber(groupId, userId);
  }

  await stripeUtils.callbackLog(db, userId, groupId, stripeUtils.stripeActions.subscriptionDeletedByApi, event);
}
export const customer_subscription_deleted = async (event) => {
  const {data:{object}} = event;
  const {userId, groupId } = object.metadata;
  // console.log(userId, groupId);
 
  await delete_subscriber(groupId, userId);
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
  const { end } = object.lines.data[0].period;
  // console.log(userId, groupId, object);

  // store invoice in  user
  const id = [String(event.created), event.id].join("_")
  
  await db.doc(`/users/${userId}/private/stripe/invoice/${id}`).set({
    groupId: groupId || "",
    invoiceUrl: object.invoice_pdf,
    created: object.created,
  });

  const period = {
    end: end,
  };
  // update period in group
  await db.doc(`/groups/${groupId}/members/${userId}/private/stripe`).set({
    period,
  }, {merge:true});
  await db.doc(`/groups/${groupId}/members/${userId}`).set({
    period,
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
    } else if (event.type === "customer.subscription.updated") {
      await customer_subscription_updated(event);
    } else if (event.type === "customer.subscription.created") {
      // check update cancel
      console.log("subscription created");
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
  const groupInfo = snapshot.data() || {};
  const groupId = groupInfo.groupId;

  const group = groupId ?
    ((await db.doc(`groups/${groupId}`).get()).data() || {})
    :
    { title:"Invalid Group Name" };

    //res.json({name: groupName, title:group.title});
  console.log("group:", group);

  function escapeHtml (str:string):string {
    if(typeof str !== 'string') {
      return '';
    }
    const mapping:any = {
      '&': '&amp;',
      "'": '&#x27;',
      '`': '&#x60;',
      '"': '&quot;',
      '<': '&lt;',
      '>': '&gt;',
    };
    return str.replace(/[&'`"<>]/g, function(match) {
      return mapping[match]
    });
  }

  res.set('Cache-Control', 'public, max-age=300, s-maxage=600');
  fs.readFile('./templates/index.html', 'utf8', (err, data) => {
    //console.log('template', err, data);
    const regex = /<meta property="og:title".*title>/
    const metas = 
      '\n<meta property="og:title" content="' + escapeHtml(group.title) + '" />'
      //+ '\n<meta property="og:description" content="Speech Bubbles by ' + escapeHtml(article.name) + '" />'
      + '\n<title>' + escapeHtml(group.title) + '</title>\n';
    res.send(data.replace(regex, metas));
  });  
};

router.get('/hello',
           logger,
           hello_response);

router.post('/stripe',
            logger,
            stripe_parser);

app.use('/1.0', router);

app.get('/g/:groupName', ogpPage);
app.get('/g/:groupName/*', ogpPage);