import { Model as LinvoDB } from '../src';

// LinvoDB.defaults.store = { db: leveljs }; // Comment out to use LevelDB instead of level-js

const DB_PATH = 'tests/testdata/lvDoc11.db';

// 初始化时传入当前collection的名称
// const doc11 = new LinvoDB('lvDoc11', { filename: DB_PATH });

// console.log(';; Doc ', doc11);

// you can use the .insert method to insert one or more documents
// doc11.insert({ _id: 'id11', aa: 33 }, (err, newDoc) => {
// doc11.insert({ _id: 'testId', aa: 5, stuff: true }, (err, newDoc) => {
//   console.log(';; insert-cb ', newDoc);
//   doc11.find({}, (err, docs) => {
//     console.log(';; find-u ', docs);
//   });
// });

// doc11.update({ aa: 5 }, { aa: 55 }, { upsert: true }, (err, numReplaced) => {
//   console.log(';; numReplaced ', numReplaced); //1
//   doc11.find({}, (err, docs) => {
//     console.log(';; find-u ', docs);
//   });
// });

// doc11.insert([{ a: 3 }, { a: 42 }], (err, newDocs) => {
//   // Two documents were inserted in the database
//   // newDocs is an array with these documents, augmented with their _id
//   // If there's an unique constraint on 'a', this will fail, and no changes will be made to the DB
//   // err is a 'uniqueViolated' error
// });

const title = 'Gone Girl';
const description = 'a wife disappeared, a husband is suspected';
const docTest = {
  title,
  description,
  date: '2014-10-03',
};
(async () => {
  const db = new LinvoDB('lvDoc11', { filename: DB_PATH });
  await db.initFullTextSearch();

  const result1 = await db.textSearch(title);
  console.dir(result1, { depth: null });
  const res = await db.textIndex(docTest);
  const result2 = await db.textSearch(title);
  console.dir(result2, { depth: null });
})();
