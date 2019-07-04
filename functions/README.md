
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
export STRIPE_ENDPOINT_SECRET="xxxx"

```

### set stripe secret key on firebase

```
firebase functions:config:set  stripe.secret_key=${STRIPE_SECRET}

firebase functions:config:set  stripe.endpoint_secret=${STRIPE_ENDPOINT_SECRET}

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


### Stripe model

Stripeのデータとegroupのデータの関連は、()内がegroupとして、

Product(Group) -> Plan(Plan)  -> Subscription <- Customer(User) <- Sources(Payment method)


# グループ
グループで課金を開始すると、ProductとPlanを作成する。
課金プランを増やすとPlanを複数追加していく。
グループとPlanは1:1

# ユーザ
ユーザとCustomerは1:1で紐づく
StripeのSpecではカード情報は1:nで複数ひもづけ可能だが、egroupでは、1:1としてある。

# 削除のタイミング

ユーザが課金をやめる時/グループを退会する時に、Subscriptionを削除。
ユーザがegroupを退会する時は、Customerを削除。(Subscriptionも同時に削除される）
管理人がグループを削除する時にProductを削除（すると、紐づくPlanも一緒に削除される）

