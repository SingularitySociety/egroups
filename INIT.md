# プロジェクト
Firebaseコンソールでプロジェクトを作る

domain設定する (route 53でdns設定とFirebase hostingの設定)

## functions:config関連のデータ

### データ取得と確認

- AWS関係
  - SESのメールのドメインを設定する
  -  onetimekey用のSMSは、特に設定することはない

- STRIPE
  - https://dashboard.stripe.com/apikeys シークレットキーをとる
  - https://dashboard.stripe.com/webhooks callbackのエンドポイントを指定してsecret keyを取得

### webhooks callback 
https://dashboard.stripe.com/webhooks から設定をする

- url
  - https://{host}}/api/1.0/stripe
- イベントタイプ
  - invoice.payment_succeeded
  - charge.succeeded
  - customer.subscription.deleted


### CLIのコンソール追加

```
firebase use --add 
firebase functions:config:get --project   e-group-jp

firebase functions:config:set stripe.endpoint_secret=${STRIPE_ENDPOINT_SECRET} // for express callback
firebase functions:config:set stripe.secret_key="${STRIPE_SECRET_KEY}"

firebase functions:config:set aws.id=${AWS_ID}
firebase functions:config:set aws.secret=${AWS_SECRET}

firebase functions:config:set aws.smtp_id=${AWS_SMTP_USERNAME}
firebase functions:config:set aws.smtp_passwd=${AWS_SMTP_PASSWORD}
```
