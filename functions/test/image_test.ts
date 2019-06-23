// import * as supertest from 'supertest';
import * as image from '../src/image';
import { should } from 'chai';
import * as constant from '../src/constant'

should()

describe('image function', () => {
  it('should return diff', () => {
    const path1 = "groups/PMVo9s1nCVoncEwju4P3/articles/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q";
    image.validImagePath(path1, constant.matchImagePaths).should.equal(true);

    const path2 = "groups/PMVo9s1nCVoncEwju4P3/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q";
    image.validImagePath(path2, constant.matchImagePaths).should.equal(false);

    const path3 = "groups/PMVo9s1nCVoncEwju4P3/images/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q";
    image.validImagePath(path3, constant.matchImagePaths).should.equal(true);

    const path4 = "groups/PMVo9s1nCVoncEwju4P3/image/6jInK0L8x16NYzh6touo/E42IMDbmuOAZHYkxhO1Q";
    image.validImagePath(path4, constant.matchImagePaths).should.equal(false);

    const path5 = "groups/PMVo9s1nCVoncEwju4P3/members/6jInK0L8x16NYzh6touo/images/aaa";
    image.validImagePath(path5, constant.matchImagePaths).should.equal(true);

    const path6 = "groups/PMVo9s1nCVoncEwju4P3/members/6jInK0L8x16NYzh6touo";
    image.validImagePath(path6, constant.matchImagePaths).should.equal(false);

    const path7 = "groups";
    image.validImagePath(path7, constant.matchImagePaths).should.equal(false);

    const path8 = "groups/members";
    image.validImagePath(path8, constant.matchImagePaths).should.equal(false);
    
  })
})