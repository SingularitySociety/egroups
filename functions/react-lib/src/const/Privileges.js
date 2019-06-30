"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = void 0;
const Privileges = {
  guest: 0,
  member: 0x01,
  subscriber: 0x100,
  mentor: 0x10000,
  admin: 0x1000000,
  owner: 0x2000000
};
var _default = Privileges;
exports.default = _default;