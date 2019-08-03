"use strict";
import zenginCode from 'zengin-code';
import * as admin from 'firebase-admin';
import * as fs from 'fs';

const serviceAccount = require(process.env["HOME"] + '/.egroup-account.json');

const getDb = () => {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount)
  });
  
  const db = admin.firestore();
  return db;
}

async function main() {
  const date = Date.now();
  const data = JSON.stringify({zenginCode, date});

  const db = getDb();

  const keys = Object.keys(zenginCode);
  const banks = {};
  for (let i=0; i< keys.length; i++) {
    const key = keys[i];
    const bankInfo = zenginCode[key];      
    const branches = bankInfo.branches;
    const { name } = bankInfo;
    banks[key] = { name };
    console.log(branches)
    await db.doc(`static/zengin/branches/${key}`).set(branches);
  };
  const document = { date, banks };
  await db.doc('static/zengin').set(document);
};

main();