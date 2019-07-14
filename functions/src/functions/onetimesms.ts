import * as functions from 'firebase-functions';
import { parsePhoneNumberFromString } from 'libphonenumber-js'
import * as AWS from 'aws-sdk';
import * as logger from '../utils/logger';

const aws_key =  functions.config() && functions.config().aws &&  functions.config().aws.id || process.env.AWS_ID;
const aws_secret =  functions.config() && functions.config().aws &&  functions.config().aws.secret || process.env.AWS_SECRET;

AWS.config.update({
  region: 'ap-northeast-1',
  credentials: new AWS.Credentials(
    aws_key,
    aws_secret,
  ),
});


export const requestOnetimeSMS = async (db, data, context) => {
  const error_handler = logger.error_response_handler({func: "requestOnetimeSMS", message: "invalid request"});

  if (!context.auth || !context.auth.uid) {
    return error_handler({error_type: logger.ErrorTypes.NoUid});
  }
  const userId = context.auth.uid;
  
  const profile = (await db.doc(`/users/${userId}`).get()).data();
  const phone = (profile && profile.phone) ? profile.phone : data.phone;
  if (!phone) {
    return error_handler({error_type: logger.ErrorTypes.NoPhoneNumber});
  }
  
  const phoneNumber = parsePhoneNumberFromString(phone)
  if (!phoneNumber || !phoneNumber.isValid()) {
    return error_handler({error_type: logger.ErrorTypes.InvalidPhoneNumber });
  }
  const formatedNumber = phoneNumber.number;
  
  const token = [1, 2, 3, 4, 5, 6].map(() => { return Math.round(Math.random() * 8  + 1)}).join("")

  const ttl = Math.round(Date.now()  / 1000) + 3600;
  
  const smscode = {
    phone: formatedNumber,
    ttl,
    token,
    coount: 0
  };
  // send sms
  const params = {
    MessageAttributes: {
      "AWS.SNS.SMS.SMSType": {
        "DataType": "String",
        "StringValue": "Promotional",
      },
      "AWS.SNS.SMS.SenderID": {
        "DataType": "String",
        "StringValue": "eGroup",
      },
    },
    Subject: "From eGroup",
    Message: 'eGroup code: ' + token,
    PhoneNumber: formatedNumber,
  };
  const aws = new AWS.SNS({apiVersion: '2010-03-31'})
  // @ts-ignore
  const publishTextPromise = await aws.publish(params).promise();

  if (!publishTextPromise) {
    return error_handler({error_type: logger.ErrorTypes.AWSSMSPublish});
  }
  // save data
  await db.doc(`/users/${userId}/secret/onetime`).set({ smscode });
  
  return {
    result: true,
    phone: formatedNumber,
    ttl,
  };
  
};

