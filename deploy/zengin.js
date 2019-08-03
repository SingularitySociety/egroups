"use strict";
const zenginCode = require('zengin-code');
const fs = require('fs');
//console.log(keys);

function writeFile(path, data) {
  return new Promise((resolve, reject) => {
    fs.writeFile(path, data, (err)=>{
      if (err) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

async function main() {
  const date = Date.now();
  const data = JSON.stringify({zenginCode, date});
  try {
    await writeFile('./functions/zengin/zengin.json', data);
    console.log("success");
  } catch(err) {
    console.log(err);
  }

  /*
  const keys = Object.keys(zenginCode);
  const date = Date.now();
  const data = JSON.stringify({keys, date});
  //console.log(data);
  try {
    await writeFile('./functions/zengin/bankCodes.json', data);
    console.log("step 1");
    keys.forEach(async (key)=>{
      const bankInfo = zenginCode[key];
      const bankData = JSON.stringify(bankInfo);
      console.log(key);
      await writeFile(`./functions/zengin/${key}.json`, bankData);      
    });    
  } catch(err) {
    console.log(err);
  }
  */
}

main();