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

export const sendMail = async (db, data, context) => {
  const error_handler = logger.error_response_handler({func: "sendMail", message: "invalid request"});
  const { template, locale, values } = data;
  if (!template || !locale || !values) {
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
  try {
    const text = await readTextFile(`./templates/${locale}/${template}.txt`);
    const html = await readTextFile(`./templates/${locale}/${template}.html`);
    await utils.sendMail("satoshi.nakajima@gmail.com", "test", text, html);
    return { return:true };
  } catch(err) {
    return { return:false, err };
  }
};