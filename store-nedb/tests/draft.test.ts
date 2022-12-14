import { Datastore } from '../src';

const TEST_DB_IT = 'tests/testdata/testing11.db';

// const db1 = new Datastore(); // in-memory only db

// const db = new Datastore({ filename: './testdata/testing11.db', autoload: true });
const db = new Datastore({ filename: TEST_DB_IT });
db.loadDatabase((err) => {
  console.log(';; db-loaded ', err);
});

db.ensureIndex({ fieldName: 'year' }, () => { });

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

const docs = [
  { title: 'Seven', year: 1995, genres: ['Drama', 'Crime', 'Mystery'] },
  { title: 'Fight Club', year: 1999, genres: ['Drama'] },
  { title: 'Inception', year: 2010, genres: ['Sci-Fi', 'Action', 'Adventure'] },
  {
    title: 'Jurassic Park',
    year: 1993,
    genres: ['Sci-Fi', 'Action', 'Adventure'],
  },
  {
    title: "Schindler's List",
    year: 1993,
    genres: ['Drama', 'History', 'Biography'],
  },
];

db.insert(doc, (err, newDoc) => { });

// db.insert(docs, (err, newDocs) => { });

// Find all documents in the collection
// db.find({ year: '1993' }, (err, docs) => {
db.find({ year: 1993 }, (err, docs) => {
  console.log(';;found ', docs);
});


db.ensureIndex({ fieldName: 'title' }, () => { });


db.persistence.compactDatafile();
// db.compactDatafile();
