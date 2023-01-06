import async from 'async';
import { assert, expect } from 'chai';
import rimraf from 'rimraf';

// import { Cursor } from '../src/cursor';
import { Model } from '../src/model';

const testDb = 'tests/testdata/test1.db';

describe('full text search for data model', () => {
  let d: Model;

  it('text search initialized correctly', (done) => {
    d = new Model('testDbWithFTS', { filename: testDb, enableFullTextSearch: true });
    console.log(';; db ', d)
    expect(d.fullTextSearchInstance).to.exist;
  })

})
