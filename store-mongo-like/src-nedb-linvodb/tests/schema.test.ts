import async from 'async';
import { assert, should } from 'chai';
import fs from 'fs/promises';
import _ from 'lodash';
import rimraf from 'rimraf';

import * as docUtils from '../src/document';
import { Model } from '../src/model';
import * as Schemas from '../src/schemas';

should();

const testDb = 'tests/testdata/test3.db';

describe('Schema', function () {
  let d: Model;

  beforeEach(async () => {
    if (d) {
      try {
        await d.store.close();
      } catch (e) {
        await d.store.close();
      }
    }
    await fs.rm(testDb, { recursive: true, force: true });
    d = new Model('testDb', { filename: testDb });
    d.filename.should.equal(testDb);
    Object.keys(d.indexes).length.should.equal(1);
    // console.log(
    //   ';; bf-each1 ',
    //   d.store.status,
    //   d.getAllData().length,
    //   Object.keys(d.indexes),
    // );
  });

  // beforeEach(function (done) {
  //   async.waterfall(
  //     [
  //       function (cb) {
  //         if (!d) return cb();
  //         try {
  //           d.store.close(cb);
  //         } catch (e) {
  //           d.store.close(cb);
  //         }
  //       },
  //       function (cb) {
  //         // console.log(';; bf-each0 ', d?.store?.status);
  //         rimraf(testDb, cb);
  //       },
  //       function (cb) {
  //         // d = null;
  //         d = new Model('testDb', { filename: testDb });
  //         d.filename.should.equal(testDb);
  //         Object.keys(d.indexes).length.should.equal(1);
  //         console.log(
  //           ';; bf-each1 ',
  //           d.store.status,
  //           d.getAllData().length,
  //           Object.keys(d.indexes),
  //         );

  //         d.reload((err) => {
  //           d.resetIndexes();
  //           assert.isNull(err);
  //           d.getAllData().length.should.equal(0);
  //           return cb();
  //         });
  //       },
  //     ],
  //     done,
  //   );
  // });

  afterEach(async () => {
    d.resetIndexes();
    if (d.store.status !== 'closed') {
      await d.store.clear();
      // console.log(';; db-size ', d.getAllData().length);
      // d.getAllData().length.should.equal(0);
      try {
        await d.store.close();
      } catch (e) {
        await d.store.close();
      }
    }
  });

  describe('Indexing', function () {
    // TODO: also check dot notation for indexes on this test
    beforeEach(function (done) {
      // debugger;
      d = new Model('testDb', {
        filename: testDb,
        schema: {
          name: { index: true, unique: true, sparse: true },
          age: { index: true },
          department: { index: false },
          address: { city: { index: true } },
        },
      });

      d.insert(
        [
          {
            age: 27,
            name: 'Kelly',
            department: 'support',
            address: { city: 'Scranton' },
          },
          {
            age: 31,
            name: 'Jim',
            department: 'sales',
            address: { city: 'Scranton' },
          },
          {
            age: 33,
            name: 'Dwight',
            department: 'sales',
            address: { city: 'Scranton' },
          },
          { age: 45, name: 'Michael', department: 'management' },
          { age: 46, name: 'Toby', department: 'hr' },
          { age: 45, name: 'Phyllis', department: 'sales' },
          { age: 23, name: 'Ryan', department: 'sales' },
        ],
        (err) => {
          done();
        },
      );
    });

    it('Create indexes specified in schema, auto-indexing does not override them', function (done) {
      assert.isDefined(d.indexes.name);
      assert.isDefined(d.indexes.age);
      assert.isUndefined(d.indexes.department);

      assert.isDefined(d.indexes['address.city']);

      d.indexes.name.sparse.should.equal(true);

      d.indexes.name.unique.should.equal(true);

      d.find({ name: 'Dwight' }, (err, docs) => {
        assert.isNull(err);
        // console.log(';; docs ', docs);

        docs.length.should.equal(1);
        docs[0].name.should.equal('Dwight');

        d.indexes.name.sparse.should.equal(true);
        d.indexes.name.unique.should.equal(true);

        done();
      });
    });
  }); // End of Indexing

  describe('Validation', function () {
    it('basic type validation', function (done) {
      d = new Model('testDb', {
        filename: testDb,
        schema: {
          name: { index: true, unique: true, sparse: true, type: 'string' },
          age: { index: true, type: 'number' },
          department: { index: false },
          address: { city: { index: true } },
          other: true,
          active: Boolean, // test the new syntax
          started: Date,
        },
      });

      // debugger;
      const doc: any = d.getRawDocOfModel({
        name: 'Kelly',
        age: 27,
        department: 'support',
        address: { city: 'Scranon' },
      });
      assert.equal(doc.age, 27);

      doc.age = 28;
      doc.age.should.equal(28);
      // doc.age = 'bullshit';
      // doc.age.should.equal(28);

      // Typecasting
      doc.name = 26;
      doc.name.should.equal('26');

      // Any type allowed
      doc.other = 'test';
      doc.other.should.equal('test');
      doc.other = 5;
      doc.other.should.equal(5);

      // Booleans, also tests the constructor-based syntax (Boolean vs "boolean")
      doc.active.should.equal(false);
      doc.active = 0;
      doc.active.should.equal(false);
      doc.active = 5;
      doc.active.should.equal(true);

      // Dates
      doc.started = new Date('2014-10-28');
      doc.started.getTime().should.equal(new Date('2014-10-28').getTime());

      // doc.started = '2014-10-29';
      // doc.started.getTime().should.equal(new Date('2014-10-29').getTime());

      doc.started = new Date('2014-11-29').getTime();
      doc.started.getTime().should.equal(new Date('2014-11-29').getTime());

      done();
    });

    it('getter/setter', function (done) {
      d = new Model('testDb', {
        filename: testDb,
        schema: {
          name: { index: true, unique: true, sparse: true, type: 'string' },
          age: { index: true, type: 'number' },
          department: { index: false },
          address: { city: { index: true } },
          doubleAge: {
            get: function () {
              // @ts-expect-error fix-types
              return 2 * this.age;
            },
          },
          tripleAge: {
            get: function () {
              // @ts-expect-error fix-types
              return 3 * this.age;
            },
            set: function (v) {
              // @ts-expect-error fix-types
              this.age = v / 3;
            },
          },
        },
      });

      const doc: any = d.getRawDocOfModel({
        name: 'Kelly',
        age: 27,
        department: 'support',
        address: { city: 'Scranon' },
      });

      doc.doubleAge.should.equal(54);
      doc.tripleAge = 75;
      doc.age.should.equal(25);

      done();
    });

    // it('_id as a getter', function (done) {
    //   d = new Model(
    //     'testDb',
    //     {
    //       filename: testDb,
    //       schema: {
    //         name: { index: true, unique: true, sparse: true, type: 'string' },
    //         age: { index: true, type: 'number' },
    //         department: { index: false },
    //         address: { city: { index: true } },
    //         _id: {
    //           get: function () {
    //             // @ts-expect-error fix-types
    //             return this.name;
    //           },
    //         },
    //       },
    //     },
    //   );

    //   d.insert(
    //     [
    //       {
    //         name: 'Kelly',
    //         age: 27,
    //         department: 'support',
    //         address: { city: 'Scranon' },
    //       },
    //       {
    //         name: 'Jim',
    //         age: 29,
    //         department: 'sales',
    //         address: { city: 'Scranon' },
    //       },
    //     ],
    //     () => {
    //       d.findOne({ _id: 'Kelly' }, (err, doc) => {
    //         console.log(';; fin-doc ', doc);
    //         debugger;
    //         doc.name.should.equal('Kelly');
    //         d.insert({ name: 'Kelly' }, (err, doc) => {
    //           assert.isUndefined(doc);
    //           assert.isDefined(err);
    //           err.errorType.should.equal('uniqueViolated');
    //           done();
    //         });
    //       });
    //     },
    //   );
    // });

    // ❓ Error: Database is not open
    it('type validation via regexp', function (done) {
      d = new Model('testDb', {
        filename: testDb,
        schema: {
          name: {
            index: true,
            unique: true,
            sparse: true,
            type: /^j(.*)y$/i,
          },
        },
      });

      const doc: any = d.getRawDocOfModel({ name: 'Jay' });
      assert.equal(doc.name, 'Jay');
      doc.name = 'Jason';
      assert.equal(doc.name, 'Jay');

      doc.name = ['Jaimy'];
      assert.deepEqual(doc.name, ['Jaimy']);
      done();
    });

    it('type validation- any type', function (done) {
      d = new Model('testDb', {
        filename: testDb,
        schema: {
          name: true,
        },
      });

      const doc: any = d.getRawDocOfModel({ name: 'Jay' });
      assert.equal(doc.name, 'Jay');
      doc.name = 45;
      assert.equal(doc.name, 45);
      doc.name = 'Tom';
      assert.equal(doc.name, 'Tom');

      done();
    });

    it('type validation on underlying objects', function (done) {
      d = new Model('testDb', {
        filename: testDb,
        schema: {
          name: { index: true, unique: true, sparse: true, type: 'string' },
          age: { index: true, type: 'number' },
          department: { index: false },
          address: {
            city: { index: true, type: 'string' },
            number: 'number',
          },
        },
      });

      d.reload(() => {
        const doc: any = d.getRawDocOfModel({
          name: 'Kelly',
          department: 'support',
          address: { city: 'Scranon', number: '24' },
          age: '28',
        });
        doc.address.city = 5;
        doc.address.city.should.equal('5');
        // doc.address = { city: 10, number: '50' };
        // assert.deepEqual(doc.address, { city: '10', number: 50 }); // check if we're typecasting
        done();
      });
    });

    it('type validation on underlying arrays', function (done) {
      d = new Model('testDb', {
        filename: testDb,
        schema: {
          name: { index: true, unique: true, sparse: true, type: 'string' },
          age: { index: true, type: 'number' },
          department: { index: false },
          address: { city: { index: true } },
          tags: ['string'],
          hits: [Number],
          addons: [],
        },
      });

      const doc: any = d.getRawDocOfModel({
        name: 'Kelly',
        department: 'support',
        address: { city: 'Scranon', number: '24' },
        age: '28',
        tags: ['one', 'two', 'three'],
        hits: ['one', 1, 2],
        // don't initialize hits
      });

      // Defaults, also on-construct screening
      assert.deepEqual(doc.tags, ['one', 'two', 'three']);
      // assert.deepEqual(doc.hits, [1, 2]);
      // assert.deepEqual(doc.addons, []);

      // All values are castable, always cast
      doc.tags = ['two', 55, 99];
      assert.deepEqual(doc.tags, ['two', '55', '99']);
      doc.tags.push('five');
      doc.tags.push(5);
      assert.deepEqual(doc.tags, ['two', '55', '99', 'five', '5']);

      // We're inserting the value if castable, but not if it isn't
      doc.hits.push('595');
      doc.hits.push('bananas');
      // assert.deepEqual(doc.hits, [1, 2, 595]);

      // Schema-less
      doc.addons = [1];
      doc.addons.push('5');
      doc.addons.push(10);
      assert.deepEqual(doc.addons, [1, '5', 10]);

      done();
    });

    it('type validation on constructing', function (done) {
      d = new Model('testDb', {
        filename: testDb,
        schema: {
          name: { index: true, unique: true, sparse: true, type: 'string' },
          age: { index: true, type: 'number' },
          department: { index: false },
          address: {
            city: { index: true, type: 'string' },
            number: { type: 'number' },
          },
        },
      });

      const doc: any = d.getRawDocOfModel({
        name: 'Kelly',
        department: 'support',
        address: { city: 'Scranon', number: '24' },
        age: '28',
      });
      // doc.age.should.equal(28);
      // doc.address.number.should.equal(24);
      done();
    });

    it('default value', function (done) {
      d = new Model('testDb', {
        filename: testDb,
        schema: {
          name: {
            index: true,
            unique: true,
            sparse: true,
            type: 'string',
            default: 'Billy',
          },
          age: { index: true, type: 'number' },
          department: { index: false },
          address: { city: { index: true } },
        },
      });

      const doc: any = d.getRawDocOfModel({
        department: 'support',
        address: { city: 'Scranon' },
      });
      doc.age.should.equal(0); // Default value, without having it specified
      doc.name.should.equal('Billy'); // Default value, specified in the spec

      done();
    });
  }); // End of Validation

  describe('Normalize', function () {
    it('type shorthands', function (done) {
      assert.deepEqual(
        Schemas.normalize({
          name: 'string',
          age: { type: 'number', default: 5 },
          tags: ['string'],
        }),
        {
          name: { type: 'string' },
          age: { type: 'number', default: 5 },
          tags: { type: 'array', schema: 'string' },
        },
      );
      done();
    });

    it('nested objects', function (done) {
      assert.deepEqual(
        Schemas.normalize({
          name: 'string',
          age: { type: 'number', default: 5 },
          address: { city: 'string' },
        }),
        {
          name: { type: 'string' },
          age: { type: 'number', default: 5 },
          address: { type: 'object', schema: { city: { type: 'string' } } },
        },
      );
      done();
    });
  });

  describe('Model instance', function () {
    // TODO: also check dot notation for indexes on this test
    beforeEach(function (done) {
      d = new Model('testDb', {
        filename: testDb,
        schema: {
          name: { index: true, unique: true, sparse: true },
          age: { index: true },
          department: { index: false },
        },
      });

      d.insert(
        [
          { age: 27, name: 'Kelly', department: 'support' },
          { age: 31, name: 'Jim', department: 'sales' },
          { age: 33, name: 'Dwight', department: 'sales' },
          { age: 45, name: 'Michael', department: 'management' },
          { age: 23, name: 'Ryan', department: 'sales' },
        ],
        (err) => {
          done();
        },
      );
    });

    it('model instance construct', function (done) {
      const doc = d.getRawDocOfModel({ name: 'andy', age: 11 });
      (doc instanceof Model).should.equal(true);

      // const doc1 = new d(doc);
      // (doc1 instanceof d).should.equal(true);
      done();
    });

    it('model instance .save - update object', function (done) {
      d.findOne({ name: 'Dwight' }, (err, doc) => {
        // doc.constructor.name.should.equal('Document');

        assert.isDefined(doc);
        doc.name.should.equal('Dwight');

        doc.name = 'Dwaine';
        // doc.save((err, doc1) => {
        //   assert.isNull(err);
        //   doc1.name.should.equal('Dwaine');

        //   d.findOne({ _id: doc1._id }, function (err, doc2) {
        //     assert.isNull(err);
        //     doc2.name.should.equal(doc1.name);
        //     done();
        //   });
        // });
        done();
      });
    });

    // it('model instance .save - new object', function (done) {
    //   const doc = new d({ name: 'Big Tuna', age: 10, department: 'sales' });
    //   doc.save(function (err, doc1) {
    //     assert.isNull(err);
    //     assert.isDefined(doc1);

    //     d.findOne({ _id: doc1._id }, function (err, doc2) {
    //       assert.isNull(err);
    //       doc2.name.should.equal(doc1.name);
    //       done();
    //     });
    //   });
    // });

    it('model instance has a working .remove', function (done) {
      d.findOne({ name: 'Dwight' }, function (err, doc) {
        assert.isNull(err);
        assert.isDefined(doc);

        d.remove({ _id: doc._id }, {}, (err) => {
          assert.isNull(err);
          d.findOne({ _id: doc._id }, (err, doc1) => {
            assert.isNull(err);
            assert.isNull(doc1);

            done();
          });
        });
      });
    });

    it('model instance has a working .update', function (done) {
      d.findOne({ name: 'Dwight' }, (err, doc) => {
        assert.isNull(err);
        assert.isDefined(doc);

        d.update(
          { _id: doc._id },
          { $inc: { age: 1 } },
          { upsert: true },
          (err, c, doc1) => {
            assert.isNull(err);
            (doc1.age === doc.age + 1).should.equal(true);
            done();
          },
        );
      });
    });

    it('Model.find returns model instance', function (done) {
      d.findOne({}, (err, doc) => {
        assert.isNull(err);
        // doc.constructor.name.should.equal('Document');
        done();
      });
    });

    it('Model.update returns model instance', function (done) {
      d.update({}, { $inc: { age: 1 } }, { upsert: true }, (err, n, doc) => {
        // doc.constructor.name.should.equal('Document');
        assert.isNull(err);
        done();
      });
    });

    it('Model.insert returns model instance', function (done) {
      d.insert({ name: 'New guy' }, (err, doc) => {
        // doc.constructor.name.should.equal('Document');
        assert.isNull(err);
        done();
      });
    });

    // it('define instance method', function (done) {
    //   d.method('findSameDepartment', function (cb) {
    //     // @ts-expect-error fix-types 🚨
    //     return d.find({ department: this.department }, cb);
    //   });

    //   d.findOne({ name: 'Jim' }, function (err, jim) {
    //     jim.findSameDepartment(function (err, res) {
    //       assert.isNull(err);
    //       res.length.should.equal(3);
    //       done();
    //     });
    //   });
    // });

    // it('define static method', function (done) {
    //   d.static('findSales', function (cb) {
    //     // @ts-expect-error fix-types 🚨
    //     return this.find({ department: 'sales' }, cb);
    //   });
    //   d.findSales(function (err, sales) {
    //     assert.isNull(err);
    //     sales.length.should.equal(3);
    //     done();
    //   });
    // });
  }); // End of Model Instance

  // TODO: move this to db.test.js
  describe('Events', function () {
    it('use pre-action events to set _ctime and _mtime & test remove', function (done) {
      d.on('insert', (doc) => {
        doc._ctime = new Date();
      });
      d.on('save', (doc) => {
        doc._mtime = new Date();
      });

      // new d({ name: 'Jan', age: 32 }).save((err, doc) => {
      d.save({ name: 'Jan', age: 32 }, (err, doc) => {
        assert.isNull(err);
        // console.log(';; save-d ', doc);

        (doc._ctime instanceof Date).should.equal(true);
        (doc._mtime instanceof Date).should.equal(true);

        setTimeout(() => {
          // const original = doc.copy();
          const original = docUtils.deepCopy(doc);
          // doc.save((err, doc1) => {
          d.findOne({ _id: doc._id }, (err, doc2) => {
            assert.isNull(err);
            // console.log(';; find-d ', doc2, original);

            (doc2._ctime instanceof Date).should.equal(true);
            (doc2._mtime instanceof Date).should.equal(true);

            assert.isTrue(doc2._ctime.getTime() === original._ctime.getTime());
            // assert.isTrue(doc2._mtime.getTime() != original._mtime.getTime());
            assert.isTrue(doc2._mtime.getTime() === original._mtime.getTime());

            d.on('remove', (doc) => {
              if (doc._id === doc._id) done();
            });
            // doc2.remove();
            d.remove({ _id: doc2._id }, {}, () => {});
          });
          // });
        }, 50);
      });
    });

    it('test inserted/updated/removed events', function (done) {
      let doc;
      d.on('inserted', (docs) => {
        docs[0].name.should.equal('Jan');
      });
      d.on('removed', (ids) => {
        ids[0].should.equal(doc._id);
      });
      d.on('updated', (docs) => {
        docs[0]._id.should.equal(doc._id);
      });

      // new d((doc = { name: 'Jan', age: 32 })).save((err, d) => {
      d.save({ name: 'Jan', age: 32 }, (err, doc1) => {
        assert.isNull(err);
        doc = doc1;
        doc.age = 33;
        // doc1.save(() => {
        //   done();
        // });
        done();
      });
    });
  }); // End of Events
});
