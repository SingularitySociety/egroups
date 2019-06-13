import * as index from '../src/index';
import { should } from 'chai';
//import * as fft from 'firebase-functions-test';

should()
//const ft = fft()

// if you used the '@types/mocha' method to install mocha type definitions, uncomment the following line
// import 'mocha';

describe('Hello function', () => {
  it('should return hello world', () => {
    const req = { query: {text: 'input'} };

    const res = {
      send: (payload: string) => {
        payload.should.equal('Hello from Firebase!');
      },
    };

    index.helloWorld(req as any, res as any);

  });
});