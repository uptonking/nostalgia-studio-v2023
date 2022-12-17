import leveljs from 'level-js';

import { Model as LinvoDB } from '../src';

// The following two lines are very important
// Initialize the default store to level-js - which is a JS-only store which will work without recompiling in NW.js / Electron
// @ts-expect-error fix-types
LinvoDB.defaults.store = { db: leveljs }; // Comment out to use LevelDB instead of level-js
// @ts-expect-error fix-types; Set dbPath - this should be done explicitly and will be the dir where each model's store is saved
LinvoDB.dbPath = process.cwd();
// LinvoDB.dbPath = './lvl-path';

// @ts-expect-error fix-types
const Doc = new LinvoDB('doc', {
  /* schema, can be empty */
});

// Construct a single document and then save it
const doc = new Doc({ a: 5, now: new Date(), test: 'this is a string' });
doc.b = 13; // you can modify the doc
doc.save(function (err) {
  // Document is saved
  console.log(doc._id);
});

// Insert document(s)
// you can use the .insert method to insert one or more documents
Doc.insert({ a: 3 }, function (err, newDoc) {
  console.log(newDoc._id);
});
Doc.insert([{ a: 3 }, { a: 42 }], function (err, newDocs) {
  // Two documents were inserted in the database
  // newDocs is an array with these documents, augmented with their _id
  // If there's an unique constraint on 'a', this will fail, and no changes will be made to the DB
  // err is a 'uniqueViolated' error
});

Doc.find({}, function (err, docs) {
  console.log(';; find ', docs);
});
