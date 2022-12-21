import async from 'async';
import encode from 'encoding-down';
import events from 'events';
import hat from 'hat';
import leveldown from 'leveldown';
import levelup from 'levelup';
import _ from 'lodash';
import path from 'path';

import { EventEmitter } from '@datalking/utils-vanillajs';

import { Cursor } from './cursor';
import * as docUtils from './document';
import { Index } from './indexes';
import * as schemas from './schemas';
import type { DatastoreDefaultsOptions } from './types/datastore';
import { Bagpipe } from './utils/bagpipe';
import { once } from './utils/utils';

/** We have to keep those unique by filename because they're locked */
const stores = {};

/** We'll use that on a bagpipe instance regulating findById */
const LEVELUP_RE_TR_CONCURRENCY = 100;

// eslint-disable-next-line prefer-const
// let leveldown: any = null;
// try {
//   (async () => {
//     // leveldown = import('leveldown')
//     leveldown = await import('leveldown');
//     // leveldown = await (await import('leveldown')).default('')
//     console.log(';; leveldown ', leveldown, leveldown.default());
//   })();
// } catch (error) { }

export class Model extends EventEmitter {
  modelName: string;
  schema: any;
  /** prefer `filename` to `dbPath` */
  filename: string;
  /** Datastore id */
  _id: string;
  options: any;
  /** Indexed by field name, dot notation can be used
   * - `_id` is always indexed and since _ids are generated randomly the underlying
   * BST is always well-balanced
   */
  indexes: Record<string, Index>;
  /** Concurrency control for 1) index building and 2) pulling objects from LevelUP */
  _pipe: Bagpipe;
  /** LEVELUP_RE_TR_CONCURRENCY */
  _reTrQueue: Bagpipe;
  /** swappable persistence backend; use `static defaults.store` to customize
   * - LevelUP type */
  private store: Record<string, any>;

  /** default config for all documents, config `store.db` before constructor */
  static defaults: DatastoreDefaultsOptions = {
    autoIndexing: true,
    autoLoad: true,
    store: { db: null },
  };
  /** the dir where each model's store is saved
   * todo convert to instance prop
   * */
  static dbPath: string;
  static Cursor = Cursor;

  /** create a document-store, like a mongodb collection
   * - create all indexes from schema in constructor
   * @param name model name
   */
  constructor(name: string, options: any = {}, schema = {}) {
    super();
    // this.setMaxListeners(0);

    this.buildIndexes = this.buildIndexes.bind(this);

    if (typeof name !== 'string') {
      throw new Error('model name must be provided as string');
    }
    this.modelName = name;
    this.filename = path.normalize(
      options.filename || path.join(Model.dbPath || '.', name + '.db'),
    );
    schema = schema || options.schema || {};
    this.schema = schemas.normalize(schema); // Normalize to allow for short-hands
    this.options = { ...Model.defaults, ...options };

    this.indexes = {};
    this.indexes._id = new Index({ fieldName: '_id', unique: true });
    // create indexes from schema
    schemas.getIndexes(schema).forEach((idx) => {
      this.ensureIndex(idx);
    });

    this._pipe = new Bagpipe(1);
    this._pipe.pause();
    this._reTrQueue = new Bagpipe(LEVELUP_RE_TR_CONCURRENCY);
    this._reTrQueue._locked = {};
    this._reTrQueue._locks = {}; // Hide those in ._reTrQueue

    if (this.options.autoLoad) {
      this.initStore();
    }

    let raw = options.raw;
    if (!raw) raw = {};
    if (typeof raw === 'string') {
      raw = docUtils.deserialize(raw);
    }
    // Clone it deeply if it's schema-constructed
    // todo 重写，将当前doc对象直接赋值到Model对象
    Object.assign(
      this,
      raw.constructor.modelName ? docUtils.deepCopy(raw) : raw,
    );

    schemas.construct(this, this.schema);
    this.emit('construct', this);
  }

  /**
   * Load the store for the set filename
   */
  initStore() {
    const filename = this.filename;
    // console.log(';; init-filename ', filename);
    if (!filename) return this._pipe.pause();

    // LevelUP; the safety we have here to re-use instance is right now only because of the tests
    this.store = stores[path.resolve(filename)];

    const storeOptions = this.options.store || {};
    // console.log(';; init-options ', options, leveldown);
    const db = storeOptions.db || leveldown;
    console.log(
      ';; init-db ',
      db,
      this.store,
      this.store ? this.store.isOpen() : null,
    );
    this.store = stores[path.resolve(filename)] =
      this.store && this.store.isOpen()
        ? this.store
        : levelup(encode(db(filename), storeOptions), storeOptions);
    this._pipe.resume();
  }

  /**
   * Re-load the database by rebuilding indexes
   */
  reload(cb: (...args: any[]) => any) {
    this.emit('reset');
    this.resetIndexes();
    this._pipe.push(this.buildIndexes, () => {
      cb(null);
      this.emit('reload');
    });
  }

  /**
   * Build new indexes from a full scan
   */
  buildIndexes(cb: (...args: any[]) => any) {
    const toBuild = Object.keys(this.indexes)
      .filter((key) => !this.indexes[key].ready)
      .map((k) => this.indexes[k]);

    if (!toBuild.length) {
      return setTimeout(() => cb(null));
    }

    // Rebuild the new indexes
    toBuild.forEach((idx) => idx.reset());

    this.emit('indexesBuild', toBuild); // no onEvent handler

    this.store
      .createReadStream()
      .on('error', (err) => cb(err))
      .on('data', (data) => {
        const doc = schemas.construct(
          docUtils.deserialize(data.value),
          this.schema,
        );
        this.emit('construct', doc);
        this.emit('indexesConstruct', doc, toBuild);

        toBuild.forEach((idx) => {
          try {
            idx.insert(doc);
          } catch (e) { }
        });
      })
      .on('end', () => {
        toBuild.forEach((idx) => {
          idx.ready = true;
        });
        this.emit('indexesReady', toBuild);
        cb(null);
      });
  }

  /**
   * Get an array of all the data in the database
   */
  getAllData() {
    return this.indexes._id.getAll();
  }

  /**
   * Reset all currently defined indexes
   */
  resetIndexes() {
    Object.keys(this.indexes).forEach((i) => {
      this.indexes[i].reset();
    });
  }

  /**
   * Ensure an index is kept for this field. Same parameters as lib/indexes
   * - For now this function is synchronous, we need to test how much time it takes
   * - We use an async API for consistency with the rest of the code
   * @param {String} options.fieldName
   * @param {Boolean} options.unique
   * @param {Boolean} options.sparse
   * @param {Function} cb Optional callback, signature: err
   */
  ensureIndex(options: any = {}, callback = (...args: any[]) => { }) {
    if (!options.fieldName) {
      return callback({ missingFieldName: true });
    }
    if (this.indexes[options.fieldName]) {
      return callback(null);
    }

    this.indexes[options.fieldName] = new Index(options);

    callback(null);
  }

  /**
   * Remove an index
   * @param {String} fieldName
   * @param {Function} cb Optional callback, signature: err
   */
  removeIndex(fieldName, cb) {
    const callback = cb || (() => { });
    delete this.indexes[fieldName];
    callback(null);
  }

  /**
   * Add one or several document(s) to all indexes
   */
  addToIndexes(doc) {
    let i;
    let failingIndex;
    let error;
    const keys = Object.keys(this.indexes);
    for (i = 0; i < keys.length; i += 1) {
      try {
        this.indexes[keys[i]].insert(doc);
      } catch (e) {
        failingIndex = i;
        error = e;
        break;
      }
    }

    // If an error happened, we need to rollback the insert on all other indexes
    if (error) {
      for (i = 0; i < failingIndex; i += 1) {
        this.indexes[keys[i]].remove(doc);
      }

      throw error;
    }
  }

  /**
   * Remove one or several document(s) from all indexes
   */
  removeFromIndexes(doc) {
    Object.keys(this.indexes).forEach((i) => {
      this.indexes[i].remove(doc);
    });
  }

  /**
   * Update one or several documents in all indexes
   * To update multiple documents, oldDoc must be an array of { oldDoc, newDoc } pairs
   * If one update violates a constraint, all changes are rolled back
   */
  updateIndexes(oldDoc, newDoc = undefined) {
    let i;
    let failingIndex;
    let error;
    const keys = Object.keys(this.indexes);
    const skipId = (oldDoc && oldDoc._id) === (newDoc && newDoc._id);

    for (i = 0; i < keys.length; i++) {
      try {
        // if (! (skipId && keys[i] == '_id')) this.indexes[keys[i]].update(oldDoc, newDoc);
        this.indexes[keys[i]].update(oldDoc, newDoc);
      } catch (e) {
        failingIndex = i;
        error = e;
        break;
      }
    }

    // If an error happened, we need to rollback the update on all other indexes
    if (error) {
      for (i = 0; i < failingIndex; i += 1) {
        this.indexes[keys[i]].revertUpdate(oldDoc, newDoc);
      }

      throw error;
    }
  }

  /**
   * Insert a new document:
   * @param {Function} cb Optional callback, signature: err, insertedDoc
   *
   */
  insert(
    newDoc: Record<string, any> | Array<Record<string, any>>,
    callback = (...args: any[]) => { },
  ) {
    newDoc = Array.isArray(newDoc) ? newDoc : [newDoc];
    // .map((d) => {
    //   // return new Model(d);
    // });

    // This is a suboptimal way to do it, but wait for indexes to be up to date in order to avoid mid-insert index reset
    // We also have to ensure indexes are up-to-date
    this._pipe.push(this.buildIndexes, () => {
      try {
        // dd index to datastore
        this._insertIndex(newDoc);
      } catch (e) {
        return callback(e);
      }

      // Persist the document
      async.map(
        newDoc,
        (d, cb) => {
          this.emit('insert', d);
          // persist doc to leveldb
          d._persist(cb);
        },
        (err, docs) => {
          this.emit('inserted', docs);
          callback(err || null, err ? undefined : docs[0]);
        },
      );
    });
  }

  /**
   * Create a new _id that's not already in use
   */
  createNewId() {
    let tentativeId = hat(32);
    if (this.indexes._id.getMatching(tentativeId).length > 0) {
      tentativeId = this.createNewId();
    }
    return tentativeId;
  }

  /**
   * Prepare a document (or array of documents) to be inserted in a database - add _id and check them
   * - createDocId + checkDoc
   * @private
   */
  prepareDocumentForInsertion(newDoc: Model | Model[]) {
    (Array.isArray(newDoc) ? newDoc : [newDoc]).map((doc: Model) => {
      if (doc._id === undefined) doc._id = this.createNewId();
      docUtils.checkObject(doc);
    });

    return newDoc;
  }

  /**
   * If newDoc is an array of documents, this will insert all documents in the cache
   * @private
   */
  _insertIndex(newDoc) {
    if (Array.isArray(newDoc)) {
      this._insertMultipleDocsInIndex(newDoc);
    } else {
      this.addToIndexes(this.prepareDocumentForInsertion(newDoc));
    }
  }

  /**
   * If one insertion fails (e.g. because of a unique constraint), roll back all previous
   * inserts and throws the error
   * @private
   */
  _insertMultipleDocsInIndex(newDocs) {
    let failedIndex;
    let error;
    let preparedDocs = this.prepareDocumentForInsertion(newDocs);
    if (!Array.isArray(preparedDocs)) {
      preparedDocs = [preparedDocs];
    }

    for (let i = 0; i < preparedDocs.length; i += 1) {
      try {
        this.addToIndexes(preparedDocs[i]);
      } catch (e) {
        error = e;
        failedIndex = i;
        break;
      }
    }

    if (error) {
      for (let i = 0; i < failedIndex; i += 1) {
        this.removeFromIndexes(preparedDocs[i]);
      }
      throw error;
    }
  }

  /**
   * Beginning of the public functions
   *
   * Find a document by ID
   * This function is also used internally after looking up indexes to retrieve docs
   * @param {Object} ID
   */
  findById(id, callback) {
    return this.findOne({ _id: id }, callback);
  }

  /**
   * Count all documents matching the query
   * @param {Object} query MongoDB-style query
   */
  count(query, callback, quiet) {
    const cursor = new Cursor(this, query);
    cursor._quiet = quiet; // Used in special circumstances, such as sync
    if (typeof callback === 'function') cursor.count(callback);
    return cursor;
  }

  /**
   * Find all documents matching the query
   * - If no callback is passed, we return the cursor so that user can limit, skip and finally exec
   * @param {Object} query MongoDB-style query
   */
  find(query, callback = (...args: any[]) => { }, quiet = undefined) {
    const cursor = new Cursor(this, query, (err, docs, callback) => {
      return callback(err ? err : null, err ? undefined : docs);
    });
    cursor._quiet = quiet; // Used in special circumstances, such as sync
    if (typeof callback === 'function') {
      cursor.exec(callback);
    }
    return cursor;
  }

  /**
   * Find one document matching the query
   * @param {Object} query MongoDB-style query
   */
  findOne(query, callback) {
    const cursor = new Cursor(this, query, (err, docs, callback) => {
      if (err) {
        return callback(err);
      }
      return callback(null, docs.length ? docs[0] : null);
    });

    if (typeof callback === 'function') cursor.exec(callback);
    return cursor;
  }

  /**
   * Live query shorthand
   * @param {Object} query MongoDB-style query
   */
  live(query) {
    return this.find(query).live();
  }

  update(modifier, cb) {
    if (this._id === undefined) this._id = this.createNewId();
    return this._update({ _id: this._id }, modifier, { upsert: true }, cb);
  }

  /**
   * Update all docs matching query
   * @param {Object} query
   * @param {Object} updateQuery
   * @param {Object} options Optional options
   *                 options.multi If true, can update multiple documents (defaults to false)
   *                 options.upsert If true, document is inserted if the query doesn't match anything
   * @param {Function} cb Optional callback, signature: err, numReplaced, upsert (set to true if the update was in fact an upsert)
   *
   * @api private Use Model.update which has the same signature
   *
   * NOTE things are a bit wonky here with atomic updating and lock/unlock mechanisms; I'm not sure how it will fare with deep object
   * updating, since constructing a new document instance via the constructor does shallow copy; but seems it will be OK, since
   * we only do that at the end, when everything is successful
   */
  _update(query, updateQuery, options, cb) {
    let callback;
    let multi;
    let upsert;
    let err;

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    callback = once(cb || (() => { }));
    multi = options.multi !== undefined ? options.multi : false;
    upsert = options.upsert !== undefined ? options.upsert : false;

    const stream = Cursor.getMatchesStream(this, query);
    stream.on('error', (e) => {
      err = e;
      stream.close();
      callback(err);
    });
    stream.on('ids', (ids) => {
      const indexed = ids._indexed;

      // Special case - upsert and no found docs, which means we do an insert
      if (upsert && !ids.length) {
        let toBeInserted;

        if (typeof updateQuery === 'function') {
          // updateQuery is a function, we have to initialize schema from query
          toBeInserted = new Model(docUtils.deepCopy(query, true));
          // toBeInserted = new self(document.deepCopy(query, true));
          updateQuery(toBeInserted);
        } else {
          try {
            docUtils.checkObject(updateQuery);
            // updateQuery is a simple object with no modifier, use it as the document to insert
            toBeInserted = updateQuery;
          } catch (e) {
            // updateQuery contains modifiers, use the find query as the base,
            // strip it from all operators and update it according to updateQuery
            try {
              toBeInserted = docUtils.modify(
                docUtils.deepCopy(query, true),
                updateQuery,
              );
            } catch (e) {
              stream.close();
              callback(e);
            }
          }
        }

        return this.insert(toBeInserted, (err, newDoc) => {
          if (err) {
            return callback(err);
          }
          return callback(null, 1, newDoc);
        });
      }

      // Go on with our update; treat the error handling gingerly
      const modifications = [];
      stream.on('data', (data) => {
        try {
          if (!indexed && !docUtils.match(data.val(), query)) return; // Not a match, ignore
        } catch (e) {
          err = e;
          stream.close();
          return;
        }

        try {
          let val = data.lock(); // we're doing a modification, grab the lock - ensures we get the safe reference to the object until it's unlocked

          if (typeof updateQuery === 'function') {
            updateQuery(val);
            if (data.id != val._id) {
              throw new Error('update function cannot change _id');
            }
            data.newDoc = val;
          } else {
            data.newDoc = docUtils.modify(val, updateQuery);
          }

          data.oldDoc = val.copy();
          // _.extend(val, data.newDoc); // IMPORTANT: don't update on .modify, in case we emit an error while modifying
          Object.assign(val, data.newDoc);
          modifications.push(data);

          if (!multi) stream.close(); // Not a multi update, close after one valid modification
        } catch (e) {
          err = e;
          stream.close();
          data.unlock();
          return;
        }
      });

      stream.on('ready', () => {
        if (err) return callback(err);

        // Change the docs in memory
        try {
          this.updateIndexes(modifications);
        } catch (e) {
          return callback(e);
        }

        // Persist document
        async.map(
          modifications,
          function (d, cb) {
            // new self(d.newDoc)._persist(function (e, doc) {
            new Model(d.newDoc)._persist((e, doc) => {
              d.unlock();
              cb(e, doc);
            });
          },
          (e, docs) => {
            if (docs) this.emit('updated', docs);

            callback(
              e || null,
              e ? undefined : docs.length,
              !e && docs.length ? docs[0] : undefined,
            );
          },
        );
      });
    });
  }

  save(cb: (...args: any[]) => any = () => { }) {
    return this.saveDocs(this, cb);
  }

  /**
   * Save a document - insert it into the DB or update in-place
   * - If a field is `undefined`, it will not be saved.
   */
  saveDocs(
    doc: any | any[],
    callback: (...args: any[]) => any = () => { },
    quiet = false,
  ) {
    const docs = (Array.isArray(doc) ? doc : [doc]).map((d) => {
      // return d.constructor.modelName == self.modelName ? d : new self(d);
      // todo fix not equals
      if (d instanceof Model && d.modelName === this.modelName) {
        return d;
      }
      // const newDoc = new Model(this.modelName)
      this.insert(d, (err, newDocs) => {
        if (err) throw new Error('insert failed when saveDocs');
      });
      return this;
    });
    this.prepareDocumentForInsertion(docs);

    const existingDocs = {};
    const idsAllowed = docs
      .map((doc) => {
        if (![null, undefined, '', false, 0, NaN].includes(doc._id)) {
          return doc._id;
        } else {
          return null;
        }
      })
      .filter(Boolean);
    const stream = Cursor.getMatchesStream(this, {
      _id: { $in: idsAllowed },
      // _id: { $in: _.chain(validDocs).map('_id').compact().value() },
    });
    stream.on('error', (err) => {
      stream.close();
      callback(err);
    });
    stream.on('data', (d) => {
      existingDocs[d.id] = d.val();
    });
    stream.on('ready', () => {
      const modifications = [];
      docs.forEach((d) => {
        modifications.push({ oldDoc: existingDocs[d._id], newDoc: d });
      });

      try {
        this.updateIndexes(modifications);
      } catch (err) {
        return callback(err);
      }

      async.each(
        modifications,
        (m, cb) => {
          if (!m.oldDoc && !quiet) {
            this.emit('insert', m.newDoc); // no insert handler
          }
          m.newDoc._persist(cb, quiet); // persist doc to storage
        },
        (err) => {
          if (err) return callback(err);

          const inserted = modifications
            .filter((x) => !x.oldDoc)
            .map((x) => x.newDoc);
          const updated = modifications
            .filter((x) => x.oldDoc)
            .map((x) => x.newDoc);
          if (inserted.length) this.emit('inserted', inserted, quiet);
          if (updated.length) this.emit('updated', updated, quiet);

          callback(null, docs.length <= 1 ? docs[0] : docs, {
            inserted: inserted.length,
            updated: updated.length,
          });
        },
      );
    });
  }

  remove(cb) {
    if (!this._id) return cb();

    return this._remove({ _id: this._id }, {}, cb);
  }

  /**
   * Remove all docs matching the query
   * - For now very naive implementation (similar to update)
   * @param {Object} query
   * @param {Object} options Optional options
   *                 options.multi If true, can update multiple documents (defaults to false)
   * @param {Function} cb Optional callback, signature: err, numRemoved
   *
   * @api private Use Model.remove which has the same signature
   */
  _remove(query, options, cb) {
    let callback;
    const removed = [];
    let err;

    if (typeof options === 'function') {
      cb = options;
      options = {};
    }
    callback = cb || (() => { });
    const multi = options.multi !== undefined ? options.multi : false;

    const stream = Cursor.getMatchesStream(this, query);
    let indexed;
    stream.on('ids', (ids) => (indexed = ids._indexed));
    stream.on('data', (d) => {
      try {
        const v = d.val();
        if (
          (indexed || docUtils.match(v, query)) &&
          (multi || removed.length === 0)
        ) {
          removed.push(v._id);
          this.removeFromIndexes(v);
          this.emit('remove', v);
        }
      } catch (e) {
        err = e;
      }
    });
    stream.on('ready', () => {
      if (err) return callback(err);

      // Persist in LevelUP; do this after error check
      async.each(
        removed,
        (id, cb) => this.store.del(id, cb),
        (e) => {
          this.emit('removed', removed);
          callback(e || null, e ? undefined : removed.length);
        },
      );
    });
    stream.on('error', (e) => {
      stream.close();
      callback(e);
    });
  }

  copy(strict) {
    return docUtils.deepCopy(this, strict);
  }

  serialize() {
    return docUtils.serialize(this);
  }

  /** persist all docs to levelup(idb/nodejs) */
  _persist(cb: (...args: any[]) => any, quiet = undefined) {
    if (!quiet) this.emit('save', this); // no save-event handler
    // level-up storage
    this.store.put(this._id, this.serialize(), (err) => {
      cb(err || null, err ? undefined : this);
    });
  }
}
