// import * as supertest from 'supertest';
import * as image from '../src/image';
import { should } from 'chai';
import * as constant from '../src/constant'

should()

describe('image function', () => {
  it('should test validImagePath', () => {
    const path11 = "groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q";
    image.validImagePath(path11, constant.matchImagePaths).should.equal(true);

    const path12 = "groups/PMVo9s1nCVoncEwju4P3/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q";
    image.validImagePath(path12, constant.matchImagePaths).should.equal(false);
   
    const path31 = "groups/PMVo9s1nCVoncEwju4P3/members/6jInK0L8x16NYzh6touo/images/aaa";
    image.validImagePath(path31, constant.matchImagePaths).should.equal(true);

    const path32 = "groups/PMVo9s1nCVoncEwju4P3/members/6jInK0L8x16NYzh6touo";
    image.validImagePath(path32, constant.matchImagePaths).should.equal(false);

    const path41 = "groups/PMVo9s1nCVoncEwju4P3/images/profile/6jInK0L8x16NYzh6touo";
    image.validImagePath(path41, constant.matchImagePaths).should.equal(false);

    const path42 = "groups/PMVo9s1nCVoncEwju4P3/images/profile";
    image.validImagePath(path42, constant.matchImagePaths).should.equal(true);

    const path101 = "groups";
    image.validImagePath(path101, constant.matchImagePaths).should.equal(false);

    const path102 = "groups/members";
    image.validImagePath(path102, constant.matchImagePaths).should.equal(false);
    
  })

  it('should test getStorePath', () => {
    const path1 = "groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q";
    image.getStorePath(path1).should.equal("groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/sections/E42IMDbmuOAZHYkxhO1Q");

    const path2 = "groups/5ke7ys0xGSdEEHsSPe6y/images/profile";
    image.getStorePath(path2).should.equal("groups/5ke7ys0xGSdEEHsSPe6y");

    const path3 = "groups/qIGkgW44sxFn78v8E0xu/members/deOR82RFtWMXTO9xULKYNzvADdq2/images/profile";
    image.getStorePath(path3).should.equal("groups/qIGkgW44sxFn78v8E0xu/members/deOR82RFtWMXTO9xULKYNzvADdq2");
  })  
})