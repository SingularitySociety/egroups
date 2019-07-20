import * as utils from '../utils/utils';
const fs = require('fs');

export const sendMail = async (db, data, context) => {
  return new Promise((resolve, reject) => {
    try {
      fs.readFile('../../templates/foo.txt', async (err, body) => {
        if (err) {
          resolve({ return:false, step:2, err });
        } else {
          await utils.sendMail("satoshi.nakajima@gmail.com", "test", body, body);
          resolve({ return:true });
        }
      });
    } catch(e) {
      resolve({ return:false, step:1, e });
    }
  });
};