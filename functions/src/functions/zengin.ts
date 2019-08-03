import * as utils from '../utils/utils';
import * as logger from '../utils/logger';

export const storeZenginData = async (db, data, context) => {
  const error_handler = logger.error_response_handler({func: "storeZenginData", message: "invalid request"});
  try { 
    //console.log(bankCodes);
    const zenginData = await utils.readTextFile(`./zengin/zengin.json`);
    const zengin = JSON.parse(zenginData);
    const zenginCode = zengin.zenginCode;
    const keys = Object.keys(zenginCode);
    const document = {};
    for (let i=0; i< 10 /*keys.length*/; i++) {
      const key = keys[i];
      const bankInfo = zenginCode[key];      
      const branches = bankInfo.branches;
      const { name } = bankInfo;
      document[key] = { name };
      await db.doc(`static/zengin/branches/${key}`).set(branches);
    };
  console.log(document);
    await db.doc('static/zengin').set(document);
    return { result:true };
  } catch(err) {
    console.log(err);
    return error_handler({error_type: logger.ErrorTypes.ParameterMissing});
  }
};