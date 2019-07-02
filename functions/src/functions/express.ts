import * as express from 'express';
// import * as cors from 'cors';
import * as bodyParser from 'body-parser';

export const app = express();
export const router = express.Router();

export const logger = async (req, res, next) => {
  // console.log(JSON.stringify(req.body, undefined, 1));
  console.log(req.body);
  next();
}
export const hello_response = async (req, res) =>{
  res.json({message: "hello"});
};

const customer_subscription_deleted = (req) => {
  const {data:{object}} = req
  console.log(object);
}

export const stripe_parser = async (req, res) => {
  if (req.body.type === "customer.subscription.deleted") {
    customer_subscription_deleted(req.body)
  } else if (req.body.type === "charge.succeeded") {
    console.log(req.body);
  }
  res.json({});
};

router.get('/hello',
           logger,
           hello_response);

router.post('/stripe',
            stripe_parser);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/1.0', router);
