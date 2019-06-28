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
});