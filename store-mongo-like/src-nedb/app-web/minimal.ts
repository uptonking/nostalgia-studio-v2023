import { Datastore } from '../src';

const TEST_DB_IT = 'testdata/testing11.db';

let db: Datastore;

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
  await db.ensureIndexAsync({ fieldName: 'year' });

  // await db.insertAsync(doc);
  await db.insertAsync(docsMovie);

  const docs = await db.findAsync({ year: 1993 });
  console.log(';;found ', docs);

  await db.ensureIndexAsync({ fieldName: 'title' });

  // db.persistence.compactDatafile();
  db.compactDatafile();
})();
