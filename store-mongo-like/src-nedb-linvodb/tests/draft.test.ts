import { Model as LinvoDB } from '../src';

console.log(';; LinvoDB ', LinvoDB);

// Initialize the default store to level-js - which is a JS-only store which will work without recompiling in NW.js/Electron
// LinvoDB.defaults.store = { db: leveljs }; // Comment out to use LevelDB instead of level-js
// LinvoDB.dbPath = 'tests/testdata'; // path实参 对应于 idb的objectStore名称的前一部分

// 初始化时传入当前collection的名称
const doc11 = new LinvoDB('lvDoc11', { filename: 'tests/testdata/lvDoc11.db' });

console.log(';; Doc ', doc11);

// you can use the .insert method to insert one or more documents
// doc11.insert({ _id: 'id11', aa: 33 }, (err, newDoc) => {
doc11.insert({ _id: 'testId', aa: 5, stuff: true }, (err, newDoc) => {
  console.log(';; insert-cb ', newDoc);
  doc11.find({}, (err, docs) => {
    console.log(';; find-u ', docs);
  });
});

// doc11.update({ aa: 5 }, { aa: 55 }, { upsert: true }, (err, numReplaced) => {
//   console.log(';; numReplaced ', numReplaced); //1
//   doc11.find({}, (err, docs) => {
//     console.log(';; find-u ', docs);
//   });
// });

// doc.insert([{ a: 3 }, { a: 42 }], (err, newDocs) => {
//   // Two documents were inserted in the database
//   // newDocs is an array with these documents, augmented with their _id
//   // If there's an unique constraint on 'a', this will fail, and no changes will be made to the DB
//   // err is a 'uniqueViolated' error
// });
