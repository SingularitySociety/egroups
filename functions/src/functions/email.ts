import * as utils from '../utils/utils';
import * as logger from '../utils/logger';

const replaceValues = (text, values) => {
  return Object.keys(values).reduce((str, key)=>{
      const regex = RegExp(`{${key}}`, "g");
      return str.replace(regex, values[key]);
  }, text);
}

export const sendMail = async (db, data, context) => {
  const error_handler = logger.error_response_handler({func: "sendMail", message: "invalid request"});
  const { template, locale, values, email } = data;
  if (!template || !locale || !values || !email) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  try { 
    const textTemplate = await utils.readTextFile(`./templates/${locale}/${template}.txt`);
    const text = replaceValues(textTemplate, values);
    const lines = text.split('\n');
    const subject = lines[0];
    const htmlTemplate = await utils.readTextFile(`./templates/${locale}/${template}.html`);
    const html = replaceValues(htmlTemplate, values);
    await utils.sendMail(email, subject, text, html);
    return { result:true };
  } catch(err) {
    return { result:false, message:"invalid template or language" };
  }
};