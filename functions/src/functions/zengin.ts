import * as utils from '../utils/utils';
import * as logger from '../utils/logger';
const bankCodes = require('../../zengin/bankCodes.json');

export const storeZenginData = async (db, data, context) => {
  const error_handler = logger.error_response_handler({func: "storeZenginData", message: "invalid request"});
  try { 
    //console.log(bankCodes);
    const keys = bankCodes.keys;
    const document = {};
    const key = keys[0];
 
      const bankData = await utils.readTextFile(`./zengin/${key}.json`);
      const bankInfo = JSON.parse(bankData);
      console.log(bankInfo);
      const branches = bankInfo.branches;
      delete bankInfo.branches;
      document[key] = bankInfo;
      await db.doc(`static/zengin/branches/${key}`).set(branches);

    await db.doc('static/zengin').set(document);
    /*
    const bankCodes = await utils.readTextFile(`./zengin/bank`);
    const text = replaceValues(textTemplate, values);
    const lines = text.split('\n');
    const subject = lines[0];
    const htmlTemplate = await utils.readTextFile(`./templates/${locale}/${template}.html`);
    const html = replaceValues(htmlTemplate, values);
    await utils.sendMail(email, subject, text, html);
    */
    return { result:true };
  } catch(err) {
    console.log(err);
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
};