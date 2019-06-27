
## Functions test

```
npm run watch:mocha
```

## Stripe

Get secret key from https://dashboard.stripe.com/test/apikeys

### set stripe secret key on your local env

add this line you shell config ( .bash_rc or .zshrc)

```
export STRIPE_SECRET="xxxx"
```

### set stripe secret key on firebase

```
firebase functions:config:set  stripe.secret_key="xxxx"
```



## Stripeの使い方についてです。

React側から管理するpublicな情報は

```
groups/{groupId}
```

に入れる想定です。
```
{ subscription => true }
```

をsetすると、functionsでAPIを使ってproductを取得、保存します。
さらに
```
{ plans => [2000, 3000]}
```
をsetすると、2000円と3000円のプランを作成します。

作成したproductとplanは
```
/groups/${groupId}/private/stripe
```
に保存します。
これらの情報を使って課金します。

TBD
