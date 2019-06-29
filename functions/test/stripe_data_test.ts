import { should } from 'chai';
import * as stripeUtils from '../src/utils/stripe';

// console.log(JSON.stringify(stripeCustomerData, undefined, 1));
should()

describe('Stripe data test', () => {
  it ('conv customer test', async function() {
    const stripeCustomerData = {
      "account_balance": 0,
      "address": null,
      "balance": 0,
      "created": 1561763807,
      "currency": null,
      "default_source": "card_1EqTJCJRcJsJLSj6y7RqZky2",
      "delinquent": false,
      "description": "test",
      "discount": null,
      "email": null,
      "id": "cus_test_customer_cc342f5b-f224-4839-aa01-b24b6369722a",
      "invoice_prefix": "6F88C1D4",
      "invoice_settings": {
        "custom_fields": null,
        "default_payment_method": null,
        "footer": null
      },
      "livemode": false,
      "metadata": {},
      "name": null,
      "object": "customer",
      "phone": null,
      "preferred_locales": [],
      "shipping": null,
      "sources": {
        "data": [
          {
            "address_city": null,
            "address_country": null,
            "address_line1": null,
            "address_line1_check": null,
            "address_line2": null,
            "address_state": null,
            "address_zip": null,
            "address_zip_check": null,
            "brand": "Visa",
            "country": "US",
            "customer": "cus_test_customer_cc342f5b-f224-4839-aa01-b24b6369722a",
            "cvc_check": null,
            "dynamic_last4": null,
            "exp_month": 8,
            "exp_year": 2025,
            "fingerprint": "9sqNB1O3U1NkjewO",
            "funding": "credit",
            "id": "card_1EqTJCJRcJsJLSj6y7RqZky2",
            "last4": "4242",
            "metadata": {},
            "name": null,
            "object": "card",
            "tokenization_method": null
          }
        ],
        "has_more": false,
        "object": "list",
        "total_count": 1,
        "url": "/v1/customers/cus_test_customer_cc342f5b-f224-4839-aa01-b24b6369722a/sources"
      },
      "subscriptions": {
        "data": [],
        "has_more": false,
        "object": "list",
        "total_count": 0,
        "url": "/v1/customers/cus_test_customer_cc342f5b-f224-4839-aa01-b24b6369722a/subscriptions"
      },
      "tax_exempt": "none",
      "tax_ids": {
        "data": [],
        "has_more": false,
        "object": "list",
        "total_count": 0,
        "url": "/v1/customers/cus_test_customer_cc342f5b-f224-4839-aa01-b24b6369722a/tax_ids"
      },
      "tax_info": null,
      "tax_info_verification": null
    };
    const res1 = stripeUtils.convCustomerData(stripeCustomerData);
    res1.should.deep.equal([
      { brand: 'Visa',
        country: 'US',
        exp_month: 8,
        exp_year: 2025,
        funding: 'credit',
        last4: '4242' }
    ]);
  });

  it ('conv product test', async function() {
    const stripeProductData = {
      "plans": {
        "2000_jpy": {
          "active": true,
          "aggregate_usage": null,
          "amount": 2000,
          "billing_scheme": "per_unit",
          "created": 1561665134,
          "currency": "jpy",
          "id": "plan_123_2000_jpy",
          "interval": "month",
          "interval_count": 1,
          "livemode": false,
          "metadata": {},
          "nickname": null,
          "object": "plan",
          "product": "prod_123",
          "tiers": null,
          "tiers_mode": null,
          "transform_usage": null,
          "trial_period_days": null,
          "usage_type": "licensed"
        },
        "3000_jpy": {
          "active": true,
          "aggregate_usage": null,
          "amount": 3000,
          "billing_scheme": "per_unit",
          "created": 1561665134,
          "currency": "jpy",
          "id": "plan_123_3000_jpy",
          "interval": "month",
          "interval_count": 1,
          "livemode": false,
          "metadata": {},
          "nickname": null,
          "object": "plan",
          "product": "prod_123",
          "tiers": null,
          "tiers_mode": null,
          "transform_usage": null,
          "trial_period_days": null,
          "usage_type": "licensed"
        },
        "30_usd": {
          "active": true,
          "aggregate_usage": null,
          "amount": 30,
          "billing_scheme": "per_unit",
          "created": 1561665476,
          "currency": "usd",
          "id": "plan_123_30_usd",
          "interval": "month",
          "interval_count": 1,
          "livemode": false,
          "metadata": {},
          "nickname": null,
          "object": "plan",
          "product": "prod_123",
          "tiers": null,
          "tiers_mode": null,
          "transform_usage": null,
          "trial_period_days": null,
          "usage_type": "licensed"
        }
      },
      "production": {
        "active": true,
        "attributes": [],
        "caption": null,
        "created": 1561546757,
        "deactivate_on": [],
        "description": null,
        "id": "prod_123",
        "images": [],
        "livemode": false,
        "metadata": {
          "groupId": "123"
        },
        "name": "hello",
        "object": "product",
        "package_dimensions": null,
        "shippable": null,
        "statement_descriptor": "hello",
        "type": "service",
        "unit_label": null,
        "updated": 1561665476,
        "url": null
      }
    };
    const res1 = stripeUtils.convProductData(stripeProductData);
    res1.should.deep.equal({ plans:
                             [ { active: true,
                                   amount: 2000,
                                   currency: 'jpy',
                                   id: 'plan_123_2000_jpy',
                                   interval: 'month',
                                   interval_count: 1 },
                                 { active: true,
                                   amount: 3000,
                                   currency: 'jpy',
                                   id: 'plan_123_3000_jpy',
                                   interval: 'month',
                                   interval_count: 1 },
                                 { active: true,
                                   amount: 30,
                                   currency: 'usd',
                                   id: 'plan_123_30_usd',
                                   interval: 'month',
                                   interval_count: 1 } ],
                               production:
                               { active: true,
                                 id: 'prod_123',
                                 name: 'hello',
                                 statement_descriptor: 'hello',
                                 type: 'service' } });
  });
});