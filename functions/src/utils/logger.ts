import * as merge from 'deepmerge';
import * as utils from './utils'

const isDebug = () => {
  // todo see environment value
  return true;
}

export enum ErrorTypes {
  HelloError,
  NoUid,
  ParameterMissing,
  NoUser,
  NoGroup,
  NoStripeSecret,
  NoStripeSecretData,
  AlreadyMember,
  StripeSubscriptionCreation,
  StripeApi,
  NoPhoneNumber,
  InvalidPhoneNumber,
  AWSSMSPublish,
}

export const error_messages = {
  [ErrorTypes.HelloError]:  "hello error",
  [ErrorTypes.NoUid]:  "no authentication info",
  [ErrorTypes.ParameterMissing]:  "request parameter missing",
  [ErrorTypes.NoUser]: "user not exists",
  [ErrorTypes.NoGroup]: "group not exists",
  [ErrorTypes.NoStripeSecret]: "stripe secret not exists",
  [ErrorTypes.NoStripeSecretData]: "stripe secret data not exists",
  [ErrorTypes.AlreadyMember]: "already member",
  [ErrorTypes.StripeSubscriptionCreation]: "subscription creation failed",
  [ErrorTypes.StripeApi]: "Stripe API error",
  [ErrorTypes.NoPhoneNumber]: "No phone number",
  [ErrorTypes.InvalidPhoneNumber]: "Invalid phone number",
  [ErrorTypes.AWSSMSPublish]: "AWS SMS Publish Error",
}

const get_error_string = (error) => {
  const error_log = error.log || "";
  if (error.func && !utils.isNull(error.error_type)) {
    return error.func + " error: " + error_messages[error.error_type]
  } 
  if(typeof error_log === 'string') {
    return error_log;
  } 
  return JSON.stringify(error_log, undefined, 1)
}
export const error_response = (error) => {
  const error_log_string = get_error_string(error)
  console.error(error_log_string); // this is log

  const message = error.message || "unknow error";
  
  if (isDebug()) {
    return {result: false, message, error_message: error_log_string };
  } else {
    return {result: false, message};
  }
}

export const error_response_handler = (default_error) => {
  return (error) => {
    return error_response(merge(default_error, error));
  }
}
