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
  NoSMSCodeData,
  SMSCodeNotMatch,
  SMSCodeExpired,
  AlreadyDataExists,
  StripeValidation,
  InviteNoInvite,
  InviteNoKey,
  InviteSoldOut,
  InviteNoDate,
  InviteExipred,
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
  [ErrorTypes.NoSMSCodeData]: "No sms code data",
  [ErrorTypes.SMSCodeNotMatch]: "SMSCode not match",
  [ErrorTypes.SMSCodeExpired]: "SMSCode expired",
  [ErrorTypes.AlreadyDataExists]: "Already data exists",
  [ErrorTypes.StripeValidation]: "Stripe validation error",
  [ErrorTypes.InviteNoInvite]: "Invalid InviteId",
  [ErrorTypes.InviteNoKey]: "Invalid InviteKey",
  [ErrorTypes.InviteSoldOut]: "Invite Sold Out",
  [ErrorTypes.InviteNoDate]: "Missing invite date",
  [ErrorTypes.InviteExipred]: "Expired invite",
}

const get_error_string = (error, convString=true) => {
  const error_log = error.log || "";
  if (error.func && !utils.isNull(error.error_type)) {
    return error.func + " error: " + error_messages[error.error_type]
  } 
  if(typeof error_log === 'string') {
    return error_log;
  } 
  if (convString) {
    return JSON.stringify(error_log, undefined, 1)
  } else {
    return error_log;
  }
}
export const error_response = (error) => {
  console.error(get_error_string(error)); // this is log

  const message = error.message || "unknow error";
  
  if (isDebug()) {
    return {result: false, message, error_message: get_error_string(error, false) };
  } else {
    return {result: false, message};
  }
}

export const error_response_handler = (default_error) => {
  return (error) => {
    return error_response(merge(default_error, error));
  }
}
