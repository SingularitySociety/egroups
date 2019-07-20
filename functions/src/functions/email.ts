import * as utils from '../utils/utils';

export const sendMail = async (db, data, context) => {
  await utils.sendMail("satoshi.nakajima@gmail.com", "test", "body", "body");
  return { return:true };
};