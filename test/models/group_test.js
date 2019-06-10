import * as firebase from "@firebase/testing";
import fs from "fs";

import { should } from 'chai';

should();

const projectId = "hello";
const rules = fs.readFileSync("firestore.rules", "utf8");

export const authedApp = (auth) => {
  return firebase
    .initializeTestApp({ projectId, auth })
    .firestore();
}

const db = authedApp({ uid: "alice" });

class Dinotrux {
  // instance is document
  constructor(data = {}, keys = null) {
    this.data = data;
    this.keys = keys || [this.getTableName()];
  }

  // public instance methods
  id() {
    return this.data.id;
  }
  async get() {
    const ref = this.getRef();
    const doc = await ref.get();
    const data = doc.data();
    return this.updateData(data);
  }
  async update(data) {
    const ref = this.getRef();
    ref.update(data);
    return this.updateData(data);
  }
  async set(data) {
    const ref = this.getRef();
    await ref.set(data);
    return this.updateData(data);
  }
  // todo delete
  getData() {
    return this.data;
  }
  
  // private methods
  updateData(data) {
    data.id = this.id();
    return this.data = data;
  }
  // return document reference
  getRef() {
    return db.doc(this.getPath());
  }
  // return full document path
  getPath() {
    const keys = this.keys.concat([this.data.id])
    return this.constructor.getPath(keys);
  }
  getTableName() {
    return this.constructor.getTableName();
  }
  
  // class methods

  // public
  static async get(keys=null) { 
    const doc = await db.doc(this.getPath(keys)).get();
    const data = doc.data();
    data.id = doc.id;
    return new this(data, keys);
  }
  static async create() { 
    const args = Object.values(arguments);
    const has_key = (args.length == 2)
    const keys = has_key ? args[0] : null;
    const path = has_key ? this.getPath(args[0]) : this.getPath();
    const data = has_key ? args[1] : args[0];
    
    const ret = await db.collection(path).add(data);
    data.id = ret.id;
    return new this(data, keys)
  }
  static paths() {
    return [this.getTableName()];
  }
  // method chains
  // need keys if collection is not on root.
  static all(keys=null) { 
    this.stack = db.collection(this.getPath(keys));
    this.keys = keys;
    return this;
  }
  static orderBy() {
    const args = Object.values(arguments);
    this.stack.orderBy(...args);
    return this;
  }
  static onSnapshot(callback) {
    const keys =  this.keys;
    return this.stack.onSnapshot((snapshot) => {
      const list = [];
      snapshot.forEach((doc)=>{
        const data = doc.data();
        data.id = doc.id;
        list.push(new this(data, keys));
      });
      callback(list);
    });
  }

  // private
  static getClassName() {
    return this.name;
  }
  static getTableName() {
    return this.getClassName().toLowerCase();
  }
  static getPath(keys) {
    if (keys === null || keys === undefined || keys.length === 0) {
      return this.getTableName();
    }
    const new_keys = keys.slice();
    const ret = this.paths().reduce((paths, elem) => {
      paths.push(elem);
      const value = new_keys.shift();
      if (value) {
        paths.push(value);
      }
      return paths;
    }, [])
    return ret.join("/");
  }
}

// models
class Groups extends Dinotrux {
  constructor(data, keys) {
    super(data, keys)
  }
  // no paths define. then path is from class name. path is /groups/{keys[0]}
  isOpen() {
    return this.data.privileges.membership.open
  }
}
class GroupTest extends Dinotrux {
  constructor(data, keys) {
    super(data, keys)
  }
  static paths() {
    // path is /groups/{keys[0]}/test/{keys[1]}
    return ["groups", "test"]
  }
}

before(async () => {
  await firebase.loadFirestoreRules({ projectId, rules });
  await firebase.clearFirestoreData({ projectId });
});

const sleep = msec => new Promise(resolve => setTimeout(resolve, msec));

describe("ORM app", () => {
  it("require users to log in before creating and reading a profile", async () => {
    await firebase.clearFirestoreData({ projectId });

    const detacher_groups = Groups.all().orderBy("created", "desc").onSnapshot((groups) => {
      groups.forEach((group) => {
        group.isOpen().should.equal(true);
      });
    });
    Groups.create({
      name: "123",
      privileges: {
        membership: {
          open: true
        }
      }
    });

    const group_test_names = ["test", "test2", "update"];
    const detacher_group_tests = GroupTest.all(["hoge"]).orderBy("created", "desc").onSnapshot((group_tests) => {
      group_tests.forEach((group_test) => {
        const expect = group_test_names.shift();
        group_test.getData().name.should.equal(expect);
      });
    });
    const gt_instance = await GroupTest.create(["hoge"], {
      name: "test",
    });
    const id = gt_instance.id();
    id.should.equal(gt_instance.getData().id);
    
    gt_instance.set({
      name: "test2",
    })

    gt_instance.update({
      name: "update",
    })
    const update_res = await gt_instance.get();
    update_res.name.should.equal("update");
    gt_instance.getPath().should.equal("groups/hoge/test/" + id);

    const gt_instance2 = await GroupTest.get(["hoge", gt_instance.id()]);
    gt_instance2.getData().name.should.equal("update");

    await sleep(1000);
    detacher_groups();
    detacher_group_tests();
  });
});
    