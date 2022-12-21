import leveljs from 'level-js';

import { Model as LinvoDB } from '../src';

console.log(';; LinvoDB ', LinvoDB)

// Initialize the default store to level-js - which is a JS-only store which will work without recompiling in NW.js/Electron
LinvoDB.defaults.store = { db: leveljs }; // Comment out to use LevelDB instead of level-js
LinvoDB.dbPath = './lvl-path'; // path实参 对应于 idb的objectStore名称

const doc = new LinvoDB('doc', {
  /* schema, can be empty */
});

console.log(';; Doc ', doc);

// Construct a single document and then save it
// const doc = new Doc({ a: 5, now: new Date(), test: 'test-str' });
// doc.b = 13; // you can modify the doc, just like plain object
doc.save((err) => {
  // Document is saved
  console.log(doc._id);
});

// you can use the .insert method to insert one or more documents
doc.insert({ a: 3 }, (err, newDoc) => {
  console.log(newDoc._id);
});
// doc.insert([{ a: 3 }, { a: 42 }], (err, newDocs) => {
//   // Two documents were inserted in the database
//   // newDocs is an array with these documents, augmented with their _id
//   // If there's an unique constraint on 'a', this will fail, and no changes will be made to the DB
//   // err is a 'uniqueViolated' error
// });

doc.find({}, (err, docs) => {
  console.log(';; find ', docs);
});
