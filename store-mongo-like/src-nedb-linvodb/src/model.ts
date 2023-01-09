import type { AbstractLevel } from 'abstract-level';
import async from 'async';
import hat from 'hat';
import { EntryStream } from 'level-read-stream';
import { MemoryLevel } from 'memory-level';
import path from 'path';
import si from 'search-index';

import { Cursor } from './cursor';
import * as docUtils from './document';
import { Index } from './indexes';
import * as schemas from './schemas';
import type {
  CreateIndexOptions,
  DatastoreDefaultsOptions,
} from './types/common';
import { Bagpipe } from './utils/bagpipe';
import { EventEmitter } from './utils/event-emitter';
import { once } from './utils/utils';

/** We have to keep those unique by filename because they're locked */
const stores = {};
globalThis['stores'] = stores;

/** We'll use that on a bagpipe instance regulating findById */
const LEVELUP_RE_TR_CONCURRENCY = 100;

/**
 * data model, like a table/mongodb-collection
 */
export class Model extends EventEmitter {
  /** currently not used */
  modelName: string;
  schema: any;
  /** use `filename` instead of deprecated `dbPath` */
  filename: string;
  /** @deprecated id */
  _id: string;
  /** single doc object, for testing only */
  _rawDoc: any;
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
  /**  swappable persistence backend; use `static defaults.store` to customize
   * - AbstractLevel type
   * @internal
   */
  store: AbstractLevel<string, any>;
  /** full text search for current data collection
   * @internal
   */
  textSearchInstance: any;

  /** default config for all documents, config `store.db` before constructor */
  static defaults: DatastoreDefaultsOptions = {
    autoIndexing: true,
    autoLoad: true,
    store: { db: null },
  };
  /**
   * @deprecated
   * - the dir where each model's store is saved
   * - use `filename` instead of deprecated `dbPath`
   * */
  static dbPath: string;
  static Cursor = Cursor;

  /** create a document-storage, like a mongodb collection
   * - create all indexes from schema in constructor
   * @param name model name
   */
  constructor(name: string, options: any = {}, schema?: Record<string, any>) {
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
    schema = options.schema || schema || {};
    this.schema = schemas.normalize({ ...schema }); // Normalize to allow for short-hands
    this.options = { ...Model.defaults, ...options };

    this.indexes = {};
    this.indexes._id = new Index({ fieldName: '_id', unique: true });
    // create indexes from schema
    schemas.getIndexes(this.schema).forEach((idx) => {
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

    this._rawDoc = options.raw;
    if (typeof this._rawDoc === 'string') {
      this._rawDoc = docUtils.deserialize(this._rawDoc);
    }
  }

  /**
   * Load the store for the set filename
   */
  initStore() {
    const filename = this.filename;
    if (!filename) return this._pipe.pause();

    // LevelUP; the safety we have here to re-use instance is right now only because of the tests
    this.store = stores[path.resolve(filename)];

    const storeOptions = this.options.store || {};
    // console.log(';; init-options ', storeOptions);
    const LevelLikeDbCtor = storeOptions.db || MemoryLevel;
    // console.log(';; init-db ', this.store);
    this.store = stores[path.resolve(filename)] =
      // this.store && this.store.isOpen()
      this.store && this.store.status === 'open'
        ? this.store
        : // : levelup(encode(db(filename), storeOptions), storeOptions);
        new LevelLikeDbCtor(filename, { valueEncoding: 'utf8' });
    this._pipe.resume();
  }

  async initFullTextSearch() {
    this.textSearchInstance = await si({ name: '__fts__' + this.filename });
  }

  /** insert a doc, and get current Model assigned the props of the doc  */
  getRawDocOfModel(raw: any) {
    if (typeof raw === 'string') {
      raw = docUtils.deserialize(raw);
    }
    this._rawDoc = raw || {};
    // create a Model object with initial content
    // Clone it deeply if it's schema-constructed
    Object.assign(
      this,
      raw.constructor.modelName ? docUtils.deepCopy(raw) : raw,
    );
    schemas.construct(this, this.schema);
    this.emit('construct', this);
    this.insert(raw);
    return this;
  }

  /**
   * Re-load the database by rebuilding all indexes
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
   * - register listeners for persistence backend
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

    let stream;
    /**
     * todo, migrate to level-web-stream without on data/end events
     */
    const addListenersToReadStream = () => {
      stream = new EntryStream(this.store);
      stream
        .on('error', (err) => cb(err))
        .on('data', (data) => {
          // console.log(';; buildIdx-data ', typeof data.value, data);
          // debugger;

          // todo remove unnecessary serialize work
          let dataVal = data.value;
          // if (dataVal && typeof dataVal === 'object') {
          // dataVal = JSON.stringify(data.value);
          // }
          const doc = schemas.construct(
            docUtils.deserialize(dataVal),
            this.schema,
          );
          this.emit('construct', doc);
          this.emit('indexesConstruct', doc, toBuild);

          toBuild.forEach((idx) => {
            try {
              idx.insert(doc);
            } catch (e) {
              throw new Error('insert index failed: ' + e);
            }
          });
        })
        .on('end', () => {
          toBuild.forEach((idx) => {
            idx.ready = true;
          });
          this.emit('indexesReady', toBuild);
          cb(null);
        });
    };

    try {
      // if (process.env.NODE_ENV !== 'production') {
      if (this.store.status !== 'open') {
        // /workaround for tests
        this.store.open(() => addListenersToReadStream());
      } else {
        addListenersToReadStream();
      }
      // } else {
      //   addListenersToReadStream();
      // }
    } catch (err) {
      // console.log(';; bd-idx-lvl-db ', this.store.status);
      console.error(err);
      throw new Error(err);
    }
  }

  /**
   * Get an array of all the data in the database
   */
  getAllData() {
    return this.indexes._id.getAll();
  }

  /**
   * Reset all currently defined indexes
   * - forEach indexes, `new BinarySearchTree()` + `ready=false`
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
  ensureIndex(options: CreateIndexOptions, callback = (...args: any[]) => { }) {
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
  removeIndex(fieldName: string, cb?: Function) {
    const callback = cb || (() => { });
    delete this.indexes[fieldName];
    callback(null);
  }

  /**
   * Add one or several document(s) to all indexes
   */
  addToIndexes(doc): void {
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
   * - To update multiple documents, oldDoc must be an array of { oldDoc, newDoc } pairs
   * - If one update violates a constraint, all changes are rolled back
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
   * Insert a new document: add to indexes, then persist
   * @param {Function} cb Optional callback, signature: err, insertedDoc
   *
   */
  insert(
    newDoc: Record<string, any> | Array<Record<string, any>>,
    callback = (...args: any[]) => { },
  ) {
    const isMultiDoc = Array.isArray(newDoc);
    let docs = isMultiDoc ? newDoc : [newDoc];

    // This is a suboptimal way to do it, but wait for indexes to be up to date in order to avoid mid-insert index reset
    // We also have to ensure indexes are up-to-date
    this._pipe.push(this.buildIndexes, () => {
      // debugger;
      try {
        // add index to memory
        // this._insertInIndex(newDoc);
        docs = this._insertMultipleDocsInIndex(docs);
      } catch (e) {
        // console.error(';; insertAVLErr ', e);
        return callback(e);
      }

      /** Persist the documents */
      const persistDocs = () => {
        async.map(
          docs,
          (d, cb) => {
            this.emit('insert', d);
            // persist doc to leveldb
            this._persist(d, cb);
          },
          (err, docsInCb) => {
            // console.log(';; afterInsertCb-docs ', docs, docsInCb);
            this.emit('inserted', docs);
            callback(
              err || null,
              err ? undefined : isMultiDoc ? docs : docs[0],
            );
          },
        );
      };

      try {
        if (this.textSearchInstance) {
          // todo filter fields, PUT_RAW, extra metadata of the docs
          this.textSearchInstance.PUT(docs).then((putRet) => {
            // console.log(';; fts-putRet ', putRet);
            persistDocs();
          });
        } else {
          persistDocs();
        }
      } catch (e) {
        console.error(';; fts-add-idx-err ', e);
        return callback(e);
      }
    });
  }

  /**
   * Create a new _id that's not already in use
   */
  createNewId() {
    let tentativeId = hat(64);
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
  prepareDocumentForInsertion(newDoc: any | any[]): any[] {
    (Array.isArray(newDoc) ? newDoc : [newDoc]).map((doc) => {
      if (doc._id === undefined) doc._id = this.createNewId();
      docUtils.checkObject(doc);
    });

    return newDoc;
  }

  /**
   * If newDoc is an array of documents, this will insert all documents in the cache
   * @private
   */
  // _insertInIndex(newDoc) {
  //   if (Array.isArray(newDoc)) {
  //     this._insertMultipleDocsInIndex(newDoc);
  //   } else {
  //     this.addToIndexes(this.prepareDocumentForInsertion(newDoc));
  //   }
  // }

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
      // throw new Error(error);
      throw error;
    }

    return preparedDocs;
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

  /** add doc to full text search.
   * ? better design
   */
  textIndex() {
    if (!this.textSearchInstance) {
      throw new Error(
        `full text search for ${this.modelName} must not be null.`,
      );
    }
  }

  /** full text search
   * todo return cursor
   */
  async textSearch(input: string, options = { FACETS: [] }) {
    if (!this.textSearchInstance) {
      throw new Error(
        `full text search for ${this.modelName} must not be null.`,
      );
    }
    if (!input || input.trim() === '') return;

    return await this.textSearchInstance.QUERY(
      {
        AND: [...input.trim().split(' ')],
      },
      {
        // SCORE: 'TFIDF',
        SORT: true,
        // DOCUMENTS: true,
        ...options,
      },
    );
  }

  /**
   * Count all documents matching the query
   * @param {Object} query MongoDB-style query
   */
  count(query, callback, quiet = false) {
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
  find(query, callback?: (...args: any[]) => any, quiet = undefined) {
    const cursor = new Cursor(this, query, (err, docs, cursorCb) => {
      return cursorCb(err ? err : null, err ? undefined : docs);
    });
    cursor._quiet = quiet; // Used in special circumstances, such as sync
    if (typeof callback === 'function') {
      cursor.exec(callback);
    }
    // if callback is not provided, cursor.exec wont work now
    return cursor;
  }

  /**
   * Find one document matching the query
   * @param {Object} query MongoDB-style query
   */
  findOne(query, callback = (...args: any[]) => { }) {
    const cursor = new Cursor(this, query, (err, docs, callback) => {
      if (err) {
        return callback(err);
      }
      // only return the first
      return callback(null, docs.length ? docs[0] : null);
    });

    if (typeof callback === 'function') {
      cursor.exec(callback);
    }
    return cursor;
  }

  /**
   * Live query shorthand
   * @param {Object} query MongoDB-style query
   */
  live(query) {
    return this.find(query).live();
  }

  // update(modifier, cb) {
  // if (this._id === undefined) this._id = this.createNewId();
  //   return this._update({ _id: this._id }, modifier, { upsert: true }, cb);
  // }

  /**
   * Update all docs matching query
   * @param {Object} query
   * @param {Object} updateQuery
   * @param {Object} options Optional options
   *                 options.multi If true, can update multiple documents (defaults to false)
   *                 options.upsert If true, document is inserted if the query doesn't match anything
   * @param {Function} cb Optional callback, signature: err, numReplaced, upsert (set to true if the update was in fact an upsert)
   *
   *
   * NOTE things are a bit wonky here with atomic updating and lock/unlock mechanisms; I'm not sure how it will fare with deep object
   * updating, since constructing a new document instance via the constructor does shallow copy; but seems it will be OK, since
   * we only do that at the end, when everything is successful
   */
  update(query, updateQuery, options, cb) {
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
      // debugger;
      if (upsert && !ids.length) {
        // / Special case - upsert and no found docs, which means we do an insert
        let toBeInserted;

        if (typeof updateQuery === 'function') {
          // updateQuery is a function, we have to initialize schema from query
          // toBeInserted = new self(document.deepCopy(query, true));
          toBeInserted = docUtils.deepCopy(query, true);
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
          if (err) return callback(err);
          return callback(null, 1, newDoc);
        });
      }

      // Go on with our update; treat the error handling gingerly
      const modifications = [];
      stream.on('data', (data) => {
        // debugger;
        try {
          if (!indexed && !docUtils.match(data.val(), query)) return; // Not a match, ignore
        } catch (e) {
          err = e;
          stream.close();
          return;
        }

        try {
          // we're doing a modification, grab the lock - ensures we get the safe reference to the object until it's unlocked
          const val = data.lock();

          if (typeof updateQuery === 'function') {
            updateQuery(val);
            if (data.id !== val._id) {
              throw new Error('update function cannot change _id');
            }
            data.newDoc = val;
          } else {
            data.newDoc = docUtils.modify(val, updateQuery);
          }

          // data.oldDoc = val.copy();
          data.oldDoc = docUtils.deepCopy(val);
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
        // debugger;
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
          (d, cb) => {
            // new self(d.newDoc)._persist(function (e, doc) {
            this._persist(d.newDoc, (e, doc) => {
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

  /** @deprecated */
  // save(cb: (...args: any[]) => any = () => { }) {
  //   return this.saveDocs(this, cb);
  // }

  /**
   * @deprecated use {@link Model#insert}
   * Save a document - insert it into the DB or update in-place
   * - it allows bulk save, and would account for re-saving (updating) objects, unlike insert which only does new inserts.
   * - If a field is `undefined`, it will not be saved.
   */
  save(
    doc: any | any[],
    callback: (...args: any[]) => any = () => { },
    quiet = false,
  ) {
    const docs = this.prepareDocumentForInsertion(
      Array.isArray(doc) ? doc : [doc],
    );

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
          this._persist(m.newDoc, cb, quiet); // persist doc to storage
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

  // remove(cb) {
  //   if (!this._id) return cb();
  //   return this._remove({ _id: this._id }, {}, cb);
  // }

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
  remove(query, options, cb) {
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
    stream.on('data', async (d) => {
      let v;
      try {
        v = d.val();
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
        (id, cb) => {
          if (this.textSearchInstance) {
            this.textSearchInstance
              .DELETE(id)
              .then(() => {
                this.store.del(id, cb);
              })
              .catch(cb);
          } else {
            this.store.del(id, cb);
          }
        },
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

  /** @deprecated to remove */
  copy(strict) {
    return docUtils.deepCopy(this, strict);
  }

  serialize() {
    return docUtils.serialize(this);
  }

  /** persist all docs to level-like-db(idb/nodejs) */
  _persist(doc, cb: (...args: any[]) => any, quiet = undefined) {
    if (!quiet) this.emit('save', doc); // no save-event handler
    // level-up storage
    this.store.put(doc._id, docUtils.serialize(doc), (err) => {
      cb(err || null, err ? undefined : doc);
    });
  }
}
