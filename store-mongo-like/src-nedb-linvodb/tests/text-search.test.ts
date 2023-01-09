import { expect } from 'chai';
import fs from 'fs/promises';

import { Model } from '../src/model';

const testDb = 'tests/testdata/test1.db';

const title = 'Gone Girl';
const description = 'a wife disappeared, a husband is suspected';
const docTest = {
  title,
  description,
  date: '2014-10-03',
};

describe('✨ full text search for data model', () => {
  let db: Model;
  let si: any;

  beforeEach(async function beforeTestFTS() {
    // console.log(';; beforeTestFTS');
    db = new Model('testDbWithFTS', {
      filename: testDb,
    });
    await db.initFullTextSearch();
    si = db.textSearchInstance;
  });

  afterEach(async function afterTestFTS() {
    // console.log(';; afterTestFTS');
    await db.store.close();
    await fs.rm(testDb, { recursive: true, force: true });
    await fs.rm('__fts__' + testDb, { recursive: true, force: true });
  });

  it('fts search instance initialized correctly', () => {
    // console.log(';; db ', db);
    expect(db.textSearchInstance).to.exist;
    expect(db.textSearchInstance.QUERY).to.exist;
    expect(db.textSearch).to.exist;
  });

  it('fts-index create', (done) => {
    si.ALL_DOCUMENTS().then((all) => {
      expect(all.length).to.equal(0);

      db.insert(docTest, (err) => {
        expect(err).to.not.exist;
        si.ALL_DOCUMENTS().then((all) => {
          expect(all.length).to.equal(1);
          done();
        });
      });
    });
  });

  it('fts-index remove', (done) => {
    si.ALL_DOCUMENTS().then((all) => {
      expect(all.length).to.equal(0);

      db.insert(docTest, (err, retDoc) => {
        expect(err).to.not.exist;

        db.remove({ _id: retDoc._id }, {}, (err) => {
          expect(err).to.not.exist;

          si.ALL_DOCUMENTS().then((all) => {
            expect(all.length).to.equal(0);
            done();
          });
        });
      });
    });
  });

  it('fts-index update', (done) => {
    si.ALL_DOCUMENTS().then((all) => {
      expect(all.length).to.equal(0);

      db.insert(docTest, (err, retDoc) => {
        expect(err).to.not.exist;

        si.ALL_DOCUMENTS().then((all) => {
          expect(all.length).to.equal(1);
          db.update(
            { _id: retDoc._id },
            { ...retDoc, title: 'hello-title' },
            {},
            (err) => {
              expect(err).to.not.exist;

              si.ALL_DOCUMENTS().then((all) => {
                expect(all.length).to.equal(1);
                done();
              });
            },
          );
        });
      });
    });
  });

  it('full text search general search', (done) => {
    db.insert(docTest, (err) => {
      expect(err).to.not.exist;

      db.textSearch(title).then((r1) => {
        expect(r1.RESULT_LENGTH).to.be.gt(0);

        db.textSearch(title + Math.random()).then((r2) => {
          expect(r2.RESULT_LENGTH).to.equal(0);
          done();
        });
      });
    });
  });

  it('search by facets', (done) => {
    db.insert(docTest, (err) => {
      expect(err).to.not.exist;
      // console.log(';; fts-err ', err);

      // const allDocs = await si.QUERY({ ALL_DOCUMENTS: true });
      // console.log(';; allIdx ', allDocs)
      // debugger;

      const opts = { FACETS: ['description'] };
      const searchInput = description.split(' ').slice(-1)[0];
      db.textSearch(searchInput, opts).then((r1) => {
        // console.log(';; r1 ', searchInput, r1);
        expect(r1.RESULT_LENGTH).to.be.gt(0);

        db.textSearch(title, opts).then((r2) => {
          // console.log(';; r2 ', r2);
          expect(r2.RESULT_LENGTH).to.be.gt(0);
          done();
        });
      });
    });
  });
});
