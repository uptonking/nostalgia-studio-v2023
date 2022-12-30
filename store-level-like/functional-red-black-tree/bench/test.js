'use strict';

const createTree = require('../rbtree.js');

let t = createTree();

const s = Date.now();
for (let i = 0; i < 100000; ++i) {
  t = t.insert(Math.random(), Math.random());
}
console.log(Date.now() - s);
