
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

## AWS

### set aws id/secret on your local env

add this line you shell config ( .bash_rc or .zshrc)

```
export AWS_ID="xxxx"
export AWS_SECRET="xxxx"

export AWS_SMTP_USERNAME="xxx"
export AWS_SMTP_PASSWORD="xxx"

```

### set stripe secret key on firebase

```
firebase functions:config:set aws.id=${AWS_ID}
firebase functions:config:set aws.secret=${AWS_SECRET}
firebase functions:config:set aws.smtp_id=${AWS_SMTP_USERNAME}
firebase functions:config:set aws.smtp_passwd=${AWS_SMTP_PASSWORD}
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


## Stripe model

Stripeのデータとegroupのデータの関連は、()内がegroupとして、

Product(Group) -> Plan(Plan)  -> Subscription <- Customer(User) <- Sources(Payment method)


### グループ
グループで課金を開始すると、ProductとPlanを作成する。
課金プランを増やすとPlanを複数追加していく。
グループとPlanは1:1

### ユーザ
ユーザとCustomerは1:1で紐づく
StripeのSpecではカード情報は1:nで複数ひもづけ可能だが、egroupでは、1:1としてある。

### 削除のタイミング

ユーザが課金をやめる時/グループを退会する時に、Subscriptionを削除。
ユーザがegroupを退会する時は、Customerを削除。(Subscriptionも同時に削除される）
管理人がグループを削除する時にProductを削除（すると、紐づくPlanも一緒に削除される）

## Group

# カード情報登録時
    /users/${userId}/secret/stripe  (stripe.createCustomer)
    /users/${userId}/private/stripe  (stripe.createCustomer)

# 入会時に記録、追加するもの。
    /groups/${groupId}/members/${userId} { profile } (group.createGroup(owner) or front or stripe.createSubscribe)

    (オーナーおよび招待者)
    /groups/${groupId}/members/${userId}/private/membership   (group.createGroup)

    (課金ユーザ)
    /groups/${groupId}/privileges/${userId} {value: privilege}  (group.memberDidCreate) (自動的に削除される)
    /privileges/${userId}  {[groupId]: privilege}   (group.memberDidCreate)(自動的に削除される)

    /groups/${groupId}/members/${userId}/secret/stripe (stripe.createSubscribe) (決済生情報) (自動的に削除される)
    /groups/${groupId}/members/${userId}/private/stripe (stripe.createSubscribe)  (決済情報)(自動的に削除される)
    /users/${userId}/private/stripe  (決済情報)  (web hooksで削除)
    
    /users/{userId}/billings  (課金情報のログをとる)
    /stripelog/{logId} ログ

# 更新時に記録するもの。（ログだけでもとっておく）
     invoice.payment_succeeded などinvoiceだと、planやsubscriptionがとれる。
     Stripe のWeb Hooksによってデータが送られてくる。
     基本的にSubscription deleteされない限りは有効なので、更新処理はしない。
     ログをとる

      表示用にでも、有効期限を更新
      /groups/${groupId}/members/${userId}/private/stripe
       { period: {start: 0, end: 1}} のように有効期限を入れている。有効期限のendを更新する
      /users/${userId}/private/stripe/invoice/{invoiceId}
         {
            groupId,
            invoiceUrl: object.invoice_pdf,
            created: object.created,
         }
         invoiceIdはtimestamp_idなので、ソートすると新しいものからとれる。
      /users/{userId}/billings  (課金情報のログをとる)
      
# 退会時に記録、削除するもの。
    アクションがあった時
      (a) /groups/{groupId}/members/{userId}/private/stripe に “resigning=true
    ~~ 有効期限翌日 ~~
      ~~ functionで、課金情報を消して、privilegeを変える。必要ならmemberも削除 ~~
    有効期限日
      Stripeからeventが送られてくる。
      課金情報を消して、privilegeを変える。必要ならmemberも削除。ログもとる。

    退会
      subscription.updateで、cancel_at_period_end をtrueにする
      (a)をtrueにして、有効期限の最終日を記録する
    退会の取消し
      subscription.updateで、cancel_at_period_end をfalseにする
      (a)をfalseにして、有効期限の最終日を削除

    /groups/${groupId}/members/${userId} を削除すると、subcollectionと privilegeも消える。
    基本的に復活できないので要注意。


    /users/{userId}/billings  (課金情報のログをとる)
    ~~ どのタイミングでStripe側のsubscriptionを削除するか？ ~~

      

　　  考えられる退会パターン
        On egroup
          ユーザが明示的にサービス上で退会。「正常系」
          グループがなくなる
          　更新無効機能を作って、課金している期間は存在させたほうがよいかも。じゃないと返金処理発生するかも。
          　有効期限など含めて、グループオーナー向け規約と、ユーザ向けの規約が必要
            * この場合は、全ユーザのcancel_at_period_endをtrueにして、一ヶ月後にグループ削除。
            なので、オーナーの規約に課金グループを廃止する場合には、一ヶ月前に告知して、一ヶ月間は最終サポートする必要があることにする。
          オーナーによって退会させられる(即時退会)
            強制退会を規約に盛り込んでおく。返金はなし。
          サービス運営により退会させられる (即時退会)
            強制退会を規約に盛り込んでおく。返金はなし。
          
        On stripe (これは、すべてイベントが送られてくるので、正常系の退会と同じ扱いで良いかな？）
          ユーザがStripe上でSubscription削除（これはできる？）
          他、ユーザがなにかのアクションをしてSubscriptionが削除（カード削除とか、Stripe退会とか？）
          カードの有効期限切れや、カードの問題による決済失敗

       強制退会は返金なし。

       /stripelogにも、ユーザ全体のログを入れる。
       /stripelogは課金だけでなく、product, plan　などのログも入れておく。
       


# 送金
  Destination Charge	
    課金グループ作成時に、custom account作成（最低限、国情報が必要）
    custom accountをsubscriptionに紐付ける

  1 グループ作成時に、custom accountを作成する。
    /groups/${groupId}/secret/account