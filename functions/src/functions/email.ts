import * as utils from '../utils/utils';
//const fs = require('fs');
//const util = require('util');

//const readFile = util.promisify(fs.readFile);

export const sendMail = async (db, data, context) => {
  try {
    //const { err, body } = readFile('../../templates/foo.txt');
    const err = "foo";
    const body = "bar";
    await utils.sendMail("satoshi.nakajima@gmail.com", "test", body, body);
    return { return:true, err };
  } catch(e) {
    return { return:false, e };
  }
};