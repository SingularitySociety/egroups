import * as utils from '../utils/utils';
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
  try {
    const str = await readTextFile('./templates/foo.txt');
    await utils.sendMail("satoshi.nakajima@gmail.com", "test", str, str);
    return { return:true };
  } catch(err) {
    return { return:false, err };
  }
};