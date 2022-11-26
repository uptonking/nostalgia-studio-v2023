import { Datastore } from '../src';

// in-memory only db
// const db1 = new Datastore();

// local-file db
const db = new Datastore({ filename: './tests/databases/test.db' });
db.loadDatabase((err) => {
  console.log(';; db-err ', err);
});

const doc = {
  hello: 'world2022',
  n: 5,
  today: new Date(),
  nedbIsAwesome: true,
  notthere: null,
  notToBeSaved: undefined, // Will not be saved
  fruits: ['apple', 'orange', 'pear'],
  infos: { name: 'nedb' },
};

db.insert(doc, (err, newDoc) => { });

db.insert([{ a: 5 }, { a: 42 }], function (err, newDocs) { });

// Find all documents in the collection
db.find({}, (err, docs) => {
  console.log(';;getAll ', docs)
});

// db.persistence.compactDatafile()
db.compactDatafile()
