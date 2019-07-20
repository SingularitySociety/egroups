import * as stripe from '../src/functions/stripe';

import { should } from 'chai';

should()

describe('function test', () => {
  it ('stripe error test', async function() {
    const error = await stripe.createSubscription("", "", "");
    error.should.deep.equal({
      result: false,
      error: {
        message: 'invalid request',
        type: 'Error',
        error_message: 'createSubscription error: no authentication info',
      }        
    });
  })
})