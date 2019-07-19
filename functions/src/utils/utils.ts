import * as functions from 'firebase-functions';
import * as nodemailer from 'nodemailer';

export const array_diff = (a: any[], b: any[]) => {
  let new_b = b.slice();
  const new_a = a.filter((i) => {
    const ret = b.indexOf(i) < 0;
    if (!ret) {
      new_b = new_b.filter((elem) => {return elem !== i});
    }
    return ret;
  });

  return [new_a, new_b];
};

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
}

export const isNull = (suspect) => {
  return suspect === null || suspect === undefined;
}

const aws_smtp_id =  functions.config() && functions.config().aws &&  functions.config().aws.smtp_id || process.env.AWS_SMTP_USERNAME;
const aws_smtp_passwd =  functions.config() && functions.config().aws &&  functions.config().aws.smtp_passwd || process.env.AWS_SMTP_PASSWORD;

export const sendMail = async (to, subject, text, html) => {
  
  const transporter = nodemailer.createTransport({
    host: "email-smtp.us-east-1.amazonaws.com",
    port: 587,
    secure: false, // true for 465, false for other ports
    auth: {
      user: aws_smtp_id,
      pass: aws_smtp_passwd,
    },
    tls: {
      ciphers:'SSLv3'
    }    
  });
  
  const info = await transporter.sendMail({
    from: 'isamu@to-kyo.to',
    to, 
    subject,
    text,
    html,
  });
  console.log("Message sent: %s", info.messageId);

}