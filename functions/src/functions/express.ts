import * as express from 'express';
// import * as cors from 'cors';
import * as bodyParser from 'body-parser';

export const app = express();
export const router = express.Router();

export const logger = async (req, res, next) => {
  console.log(JSON.stringify(req.body, undefined, 1));
  // console.log(req.body);
  next();
}
export const hello_response = async (req, res) =>{

  res.json({message: "hello"});
}
  
router.get('/hello',
           logger,
           hello_response);

router.post('/stripe',
           logger,
           hello_response);

router.get('/*',
           logger,
           hello_response);

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use('/1.0', router);
