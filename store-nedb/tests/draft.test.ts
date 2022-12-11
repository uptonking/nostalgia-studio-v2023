import { Datastore } from '../src';

const TEST_DB_IT = 'tests/testdata/testing11.db';

// in-memory only db
// const db1 = new Datastore();

// local-file db
// const db = new Datastore({ filename: './testdata/testing11.db', autoload: true });
const db = new Datastore({ filename: TEST_DB_IT });
db.loadDatabase((err) => {
  console.log(';; db-loaded ', err);
});

// const db = new Datastore({ filename: TEST_DB_IT })
// try {
//   await db.loadDatabaseAsync()
// } catch (error) {
//   // loading has failed
// }

const doc = {
  hello: 'world-202212',
  n: 5,
  today: new Date(),
  nedbIsAwesome: true,
  notthere: null,
  notToBeSaved: undefined, // Will not be saved
  fruits: ['apple', 'orange', 'pear'],
  infos: { name: 'nedb' },
};

db.insert(doc, (err, newDoc) => { });

// db.insert([{ a: 5 }, { b: 42 }], function (err, newDocs) {});

// Find all documents in the collection
db.find({}, (err, docs) => {
  console.log(';;getAll ', docs);
});

db.persistence.compactDatafile();
// db.compactDatafile();
