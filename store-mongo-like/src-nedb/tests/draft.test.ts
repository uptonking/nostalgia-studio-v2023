import { Datastore } from '../src';

const TEST_DB_IT = 'tests/testdata/testing11.db';

let db: Datastore;
// const db1 = new Datastore(); // in-memory only db

// db = new Datastore({ filename: './testdata/testing11.db', autoload: true });
// db = new Datastore({ filename: TEST_DB_IT });
// db.loadDatabase((err) => {
//   console.log(';; db-loaded ', err);
// });

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

const docsMovie = [
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

(async () => {
  db = new Datastore({ filename: TEST_DB_IT, autoload: true });
  // await db.ensureIndexAsync({ fieldName: 'year' });

  // db.insert(doc, (err, newDoc) => { });
  // await db.insertAsync(docsMovie);
  const doc1 = await db.insertAsync({ aa: 22 });
  // const doc1 = await db.insertAsync({ aa: 22, _id: 'PQ3jWlzVOsbJ7ufu' });
  console.log(';; doc1 ', doc1)


  // Find all documents in the collection
  const docs = await db.findAsync({ year: 1993 });
  console.log(';;found1 ', docs);
  const docsAll = await db.findAsync({});
  console.log(';;found ', docsAll);


  // await db.ensureIndexAsync({ fieldName: 'title' });

  // db.persistence.compactDatafile();
  db.compactDatafile();
})();
