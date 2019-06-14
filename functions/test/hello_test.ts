import * as index from '../src/index';
import { should } from 'chai';
import * as utils from '../src/utils'

should()

describe('Hello function', () => {
  it('should return diff', () => {
    const res1 = utils.array_diff([1, 2, 3], [1, 2]);
    res1.should.members([3]);

    const res2 = utils.array_diff([1, 2], [1, 2, 3]);
    res2.should.members([]);

    const res3 = utils.array_diff([1, 2], [1, 2]);
    res3.should.members([]);
  });

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