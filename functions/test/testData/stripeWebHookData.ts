export const stripeData = {
  customer_subscription_deleted: {
    "id": "evt_1EsyxzJRcJsJLSj6WJJccdWc",
    "object": "event",
    "api_version": "2019-05-16",
    "created": 1562362155,
    "data": {
      "object": {
        "id": "sub_FNkLSDsW4Qafhn",
        "object": "subscription",
        "application_fee_percent": null,
        "billing": "charge_automatically",
        "billing_cycle_anchor": 1562361737,
        "billing_thresholds": null,
        "cancel_at": null,
        "cancel_at_period_end": false,
        "canceled_at": 1562362155,
        "collection_method": "charge_automatically",
        "created": 1562361737,
        "current_period_end": 1565040137,
        "current_period_start": 1562361737,
        "customer": "cus_test_customer_4cbbdacb-8601-4562-9340-bd323d2018c7",
        "days_until_due": null,
        "default_payment_method": null,
        "default_source": null,
        "default_tax_rates": [],
        "discount": null,
        "ended_at": 1562362155,
        "items": {
          "object": "list",
          "data": [
            {
              "id": "si_FNkLmJ6dZFQtec",
              "object": "subscription_item",
              "billing_thresholds": null,
              "created": 1562361738,
              "metadata": {},
              "plan": {
                "id": "plan_sub_test_5000_jpy",
                "object": "plan",
                "active": true,
                "aggregate_usage": null,
                "amount": 5000,
                "billing_scheme": "per_unit",
                "created": 1561845631,
                "currency": "jpy",
                "interval": "month",
                "interval_count": 1,
                "livemode": false,
                "metadata": {},
                "nickname": null,
                "product": "prod_sub_test",
                "tiers": null,
                "tiers_mode": null,
                "transform_usage": null,
                "trial_period_days": null,
                "usage_type": "licensed"
              },
              "quantity": 1,
              "subscription": "sub_FNkLSDsW4Qafhn",
              "tax_rates": []
            }
          ],
          "has_more": false,
          "total_count": 1,
          "url": "/v1/subscription_items?subscription=sub_FNkLSDsW4Qafhn"
        },
        "latest_invoice": "in_1EsyrGJRcJsJLSj6WzqTWYQy",
        "livemode": false,
        "metadata": {
          "userId": "test_customer_4cbbdacb-8601-4562-9340-bd323d2018c7",
          "groupId": "sub_test"
        },
        "plan": {
          "id": "plan_sub_test_5000_jpy",
          "object": "plan",
          "active": true,
          "aggregate_usage": null,
          "amount": 5000,
          "billing_scheme": "per_unit",
          "created": 1561845631,
          "currency": "jpy",
          "interval": "month",
          "interval_count": 1,
          "livemode": false,
          "metadata": {},
          "nickname": null,
          "product": "prod_sub_test",
          "tiers": null,
          "tiers_mode": null,
          "transform_usage": null,
          "trial_period_days": null,
          "usage_type": "licensed"
        },
        "quantity": 1,
        "schedule": null,
        "start": 1562361737,
        "start_date": 1562361737,
        "status": "canceled",
        "tax_percent": null,
        "trial_end": null,
        "trial_start": null
      }
    },
    "livemode": false,
    "pending_webhooks": 1,
    "request": {
      "id": "req_aWxQXvMeLM69Qb",
      "idempotency_key": null
    },
    "type": "customer.subscription.deleted"
  },
  charge_succeeded: {
    "id": "evt_1EszRoJRcJsJLSj62EIYVjsH",
    "object": "event",
    "api_version": "2019-05-16",
    "created": 1562364003,
    "data": {
      "object": {
        "id": "ch_1EszRnJRcJsJLSj6quZrCZcR",
        "object": "charge",
        "amount": 5400,
        "amount_refunded": 0,
        "application": null,
        "application_fee": null,
        "application_fee_amount": null,
        "balance_transaction": "txn_1EszRnJRcJsJLSj6RViy1Eke",
        "billing_details": {
          "address": {
            "city": null,
            "country": null,
            "line1": null,
            "line2": null,
            "postal_code": null,
            "state": null
          },
          "email": null,
          "name": null,
          "phone": null
        },
        "captured": true,
        "created": 1562364003,
        "currency": "jpy",
        "customer": "cus_test_customer_ac003e4f-f263-457a-8d4b-27586af24f3f",
        "description": "Payment for invoice E22FCA1B-0001",
        "destination": null,
        "dispute": null,
        "failure_code": null,
        "failure_message": null,
        "fraud_details": {},
        "invoice": "in_1EszRnJRcJsJLSj6YEJbFdBl",
        "livemode": false,
        "metadata": {},
        "on_behalf_of": null,
        "order": null,
        "outcome": {
          "network_status": "approved_by_network",
          "reason": null,
          "risk_level": "normal",
          "risk_score": 29,
          "seller_message": "Payment complete.",
          "type": "authorized"
        },
        "paid": true,
        "payment_intent": "pi_1EszRnJRcJsJLSj6KSRDaOKr",
        "payment_method": "card_1EszRkJRcJsJLSj64HTgYjao",
        "payment_method_details": {
          "card": {
            "brand": "visa",
            "checks": {
              "address_line1_check": null,
              "address_postal_code_check": null,
              "cvc_check": null
            },
            "country": "US",
            "exp_month": 8,
            "exp_year": 2025,
            "fingerprint": "9sqNB1O3U1NkjewO",
            "funding": "credit",
            "last4": "4242",
            "three_d_secure": null,
            "wallet": null
          },
          "type": "card"
        },
        "receipt_email": null,
        "receipt_number": null,
        "receipt_url": "https://pay.stripe.com/receipts/acct_1EmbO8JRcJsJLSj6/ch_1EszRnJRcJsJLSj6quZrCZcR/rcpt_FNkxXC27jHT7qly1wjXPXCKsI94Sydk",
        "refunded": false,
        "refunds": {
          "object": "list",
          "data": [],
          "has_more": false,
          "total_count": 0,
          "url": "/v1/charges/ch_1EszRnJRcJsJLSj6quZrCZcR/refunds"
        },
        "review": null,
        "shipping": null,
        "source": {
          "id": "card_1EszRkJRcJsJLSj64HTgYjao",
          "object": "card",
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
          "customer": "cus_test_customer_ac003e4f-f263-457a-8d4b-27586af24f3f",
          "cvc_check": null,
          "dynamic_last4": null,
          "exp_month": 8,
          "exp_year": 2025,
          "fingerprint": "9sqNB1O3U1NkjewO",
          "funding": "credit",
          "last4": "4242",
          "metadata": {},
          "name": null,
          "tokenization_method": null
        },
        "source_transfer": null,
        "statement_descriptor": "hello",
        "status": "succeeded",
        "transfer_data": null,
        "transfer_group": null
      }
    },
    "livemode": false,
    "pending_webhooks": 1,
    "request": {
      "id": "req_0ztt9oXsddBT9g",
      "idempotency_key": "sub_cus_test_customer_ac003e4f-f263-457a-8d4b-27586af24f3f_plan_unit_test_plan_5000_jpy"
    },
    "type": "charge.succeeded"
  },
  invoice_payment_succeeded: {
    "id": "evt_1EszRoJRcJsJLSj6FNDluYcd",
    "object": "event",
    "api_version": "2019-05-16",
    "created": 1562364003,
    "data": {
      "object": {
        "id": "in_1EszRnJRcJsJLSj6YEJbFdBl",
        "object": "invoice",
        "account_country": "US",
        "account_name": "egroup",
        "amount_due": 5400,
        "amount_paid": 5400,
        "amount_remaining": 0,
        "application_fee_amount": null,
        "attempt_count": 1,
        "attempted": true,
        "auto_advance": false,
        "billing": "charge_automatically",
        "billing_reason": "subscription_create",
        "charge": "ch_1EszRnJRcJsJLSj6quZrCZcR",
        "collection_method": "charge_automatically",
        "created": 1562364002,
        "currency": "jpy",
        "custom_fields": null,
        "customer": "cus_test_customer_ac003e4f-f263-457a-8d4b-27586af24f3f",
        "customer_address": null,
        "customer_email": null,
        "customer_name": null,
        "customer_phone": null,
        "customer_shipping": null,
        "customer_tax_exempt": "none",
        "customer_tax_ids": [],
        "default_payment_method": null,
        "default_source": null,
        "default_tax_rates": [
          {
            "id": "txr_1EpqXRJRcJsJLSj692uXxIcK",
            "object": "tax_rate",
            "active": true,
            "created": 1561614773,
            "description": null,
            "display_name": "消費税",
            "inclusive": false,
            "jurisdiction": "日本",
            "livemode": false,
            "metadata": {},
            "percentage": 8
          }
        ],
        "description": null,
        "discount": null,
        "due_date": null,
        "ending_balance": 0,
        "footer": null,
        "hosted_invoice_url": "https://pay.stripe.com/invoice/invst_bdxqbrKhnuEjJu7oIi0UouxE3x",
        "invoice_pdf": "https://pay.stripe.com/invoice/invst_bdxqbrKhnuEjJu7oIi0UouxE3x/pdf",
        "lines": {
          "object": "list",
          "data": [
            {
              "id": "sli_d77689ee4b841d",
              "object": "line_item",
              "amount": 5000,
              "currency": "jpy",
              "description": "1 × unit_test (at ¥5,000 / month)",
              "discountable": true,
              "livemode": false,
              "metadata": {
                "userId": "test_customer_ac003e4f-f263-457a-8d4b-27586af24f3f",
                "groupId": "unit_test_plan"
              },
              "period": {
                "end": 1565042402,
                "start": 1562364002
              },
              "plan": {
                "id": "plan_unit_test_plan_5000_jpy",
                "object": "plan",
                "active": true,
                "aggregate_usage": null,
                "amount": 5000,
                "billing_scheme": "per_unit",
                "created": 1561665137,
                "currency": "jpy",
                "interval": "month",
                "interval_count": 1,
                "livemode": false,
                "metadata": {},
                "nickname": null,
                "product": "prod_unit_test_plan",
                "tiers": null,
                "tiers_mode": null,
                "transform_usage": null,
                "trial_period_days": null,
                "usage_type": "licensed"
              },
              "proration": false,
              "quantity": 1,
              "subscription": "sub_FNkxjTEmeLvz4h",
              "subscription_item": "si_FNkxhTXWzznucz",
              "tax_amounts": [
                {
                  "amount": 400,
                  "inclusive": false,
                  "tax_rate": "txr_1EpqXRJRcJsJLSj692uXxIcK"
                }
              ],
              "tax_rates": [],
              "type": "subscription"
            }
          ],
          "has_more": false,
          "total_count": 1,
          "url": "/v1/invoices/in_1EszRnJRcJsJLSj6YEJbFdBl/lines"
        },
        "livemode": false,
        "metadata": {},
        "next_payment_attempt": null,
        "number": "E22FCA1B-0001",
        "paid": true,
        "payment_intent": "pi_1EszRnJRcJsJLSj6KSRDaOKr",
        "period_end": 1562364002,
        "period_start": 1562364002,
        "post_payment_credit_notes_amount": 0,
        "pre_payment_credit_notes_amount": 0,
        "receipt_number": null,
        "starting_balance": 0,
        "statement_descriptor": null,
        "status": "paid",
        "status_transitions": {
          "finalized_at": 1562364003,
          "marked_uncollectible_at": null,
          "paid_at": 1562364003,
          "voided_at": null
        },
        "subscription": "sub_FNkxjTEmeLvz4h",
        "subtotal": 5000,
        "tax": 400,
        "tax_percent": 8,
        "total": 5400,
        "total_tax_amounts": [
          {
            "amount": 400,
            "inclusive": false,
            "tax_rate": "txr_1EpqXRJRcJsJLSj692uXxIcK"
          }
        ],
        "webhooks_delivered_at": null
      }
    },
    "livemode": false,
    "pending_webhooks": 1,
    "request": {
      "id": "req_0ztt9oXsddBT9g",
      "idempotency_key": "sub_cus_test_customer_ac003e4f-f263-457a-8d4b-27586af24f3f_plan_unit_test_plan_5000_jpy"
    },
    "type": "invoice.payment_succeeded"
  }
}
