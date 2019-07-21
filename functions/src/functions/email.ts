import * as utils from '../utils/utils';
import * as logger from '../utils/logger';
const fs = require('fs');

const readTextFile = async (path):Promise<any> => {
  return new Promise((resolve, reject) => {
    fs.readFile(path, 'utf8', async (err, str) => {
      if (err) {
        reject(err);
      }
      resolve(str);
    });
  });
}

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
    const textTemplate = await readTextFile(`./templates/${locale}/${template}.txt`);
    const text = replaceValues(textTemplate, values);
    const lines = text.split('\n');
    const subject = lines[0];
    const htmlTemplate = await readTextFile(`./templates/${locale}/${template}.html`);
    const html = replaceValues(htmlTemplate, values);
    await utils.sendMail(email, subject, text, html);
    return { return:true };
  } catch(err) {
    return { return:false, err };
  }
};