import * as utils from '../utils/utils';
import * as logger from '../utils/logger';

export const storeZenginData = async (db, data, context) => {
  const error_handler = logger.error_response_handler({func: "storeZenginData", message: "invalid request"});
  try { 
    //console.log(bankCodes);
    const zenginData = await utils.readTextFile(`./zengin/zengin.json`);
    const { date, zenginCode} = JSON.parse(zenginData);
    const prev = (await db.doc('static/zengin').get()).data();
    if (prev && prev.date) {
      console.log(date, prev.date);
      if (date <= prev.date) {
        return { result:true, message:"already done" };
      }
    }

    const keys = Object.keys(zenginCode);
    const banks = {};
    for (let i=0; i< keys.length; i++) {
      const key = keys[i];
      const bankInfo = zenginCode[key];      
      const branches = bankInfo.branches;
      const { name } = bankInfo;
      banks[key] = { name };
      await db.doc(`static/zengin/branches/${key}`).set(branches);
    };
    const document = { date, banks };
    await db.doc('static/zengin').set(document);
    return { result:true, message:"stored" };
  } catch(err) {
    console.log(err);
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
};