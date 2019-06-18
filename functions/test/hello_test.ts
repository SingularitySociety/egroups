import * as supertest from 'supertest';
import * as index from '../src/index';
import { should } from 'chai';
import * as utils from '../src/utils'

should()

describe('Hello function', () => {
  it('should return diff', () => {
    const res1 = utils.array_diff([1, 2, 3], [1, 2]);
    res1[0].should.members([3])
    res1[1].should.members([]);

    const res2 = utils.array_diff([1, 2], [1, 2, 3]);
    res2[0].should.members([]);
    res2[1].should.members([3]);

    const res3 = utils.array_diff([1, 2], [1, 2]);
    res3[0].should.members([]);
    res3[1].should.members([]);
  });

  it('should return hello world', async () => {
    const request = supertest(index.app);
    const response = await request.get("/api/hello");

    response.status.should.equal(200);
    response.text.should.equal("hello world with Express");
  });
});