import { should } from 'chai';
import * as utils from '../src/utils/utils'

should()

describe('utils function', () => {
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

  it('should send mail', async function() {
    this.timeout(10000);
    const to = "isamu@to-kyo.to";
    const subject = "hello";
    const text = "123";
    const html = "<b>123</b>";
    await utils.sendMail(to, subject, text, html);
  });
  
});