import * as utils from '../utils/utils';
import * as logger from '../utils/logger';
const fs = require('fs');

const readTextFile = async (path) => {
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
  const { template, locale, values, email, subject } = data;
  if (!template || !locale || !values || !email || !subject) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  try { 
    const text = await readTextFile(`./templates/${locale}/${template}.txt`);
    const html = await readTextFile(`./templates/${locale}/${template}.html`);
    await utils.sendMail(email, subject, 
      replaceValues(text, values), replaceValues(html, values));
    return { return:true };
  } catch(err) {
    return { return:false, err };
  }
};