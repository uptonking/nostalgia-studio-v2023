import async from 'async';
import encode from 'encoding-down';
import events from 'events';
import hat from 'hat';
import leveldown from 'leveldown';
import levelup from 'levelup';
import _ from 'lodash';
import path from 'path';

import { Cursor } from './cursor';
import * as document from './document';
import { Index } from './indexes';
import * as schemas from './schemas';
import { Bagpipe } from './utils/bagpipe';

/** We have to keep those unique by filename because they're locked */
const stores = {};

/** We'll use that on a bagpipe instance regulating findById */
const LEVELUP_RETR_CONCURRENCY = 100;

// let leveldown = null;
// try {
//   (async () => {
//     leveldown = await import('leveldown'); // not working
//     // leveldown = await (await import('leveldown')).default('')
//     console.log(';; leveldown ', leveldown, leveldown.default());
//   })();
// } catch (error) { }

/**
 * Create a new model
 */
export function Model(name, options: any = {}, schema = {}) {
  if (typeof name !== 'string') {
    throw 'model name must be provided and a string';
  }

  const self: any = function Document(raw) {
    // console.log(';; self===Document ', self === Document, self) // true
    // @ts-expect-error fix-types  Call the Document builder
    return document.Document.call(this, self, raw);
  };
  _.extend(self, Model.prototype); // Ugly but works - we need to return a function but still inherit prototype
  const emitter = new events.EventEmitter();
  emitter.setMaxListeners(0);
  for (const prop in emitter) self[prop] = emitter[prop];

  self.modelName = name;
  self.schema = schemas.normalize(schema); // Normalize to allow for short-hands
  self.filename = path.normalize(
    // @ts-expect-error fix-types
    options.filename || path.join(Model.dbPath || '.', name + '.db'),
  );
  // self.options = _.extend({}, Model.defaults, options);
  self.options = { ...Model.defaults, ...options };

  // Indexed by field name, dot notation can be used
  // _id is always indexed and since _ids are generated randomly the underlying
  // binary is always well-balanced
  self.indexes = {};
  self.indexes._id = new Index({ fieldName: '_id', unique: true });
  schemas.getIndexes(schema).forEach(function (idx) {
    self.ensureIndex(idx);
  });

  // Concurrency control for 1) index building and 2) pulling objects from LevelUP
  self._pipe = new Bagpipe(1);
  self._pipe.pause();
  self._retrQueue = new Bagpipe(LEVELUP_RETR_CONCURRENCY);
  self._retrQueue._locked = {};
  self._retrQueue._locks = {}; // Hide those in ._retrQueue
  self._methods = {};

  if (self.options.autoLoad) self.initStore();

  return self;
}
Model.defaults = { autoIndexing: true, autoLoad: true };

/**
 * Define a new static method for our Model
 * And then a instance-specific method
 */
Model.prototype.static = function (name, fn) {
  if (!Model.prototype.hasOwnProperty(name) && typeof fn === 'function')
    this[name] = fn;
};
Model.prototype.method = function (name, fn) {
  if (!Model.prototype.hasOwnProperty(name) && typeof fn === 'function')
    this._methods[name] = fn;
};

/**
 * Load the store for the set filename
 */
Model.prototype.initStore = function () {
  const filename = this.filename;
  if (!filename) return this._pipe.pause();

  // LevelUP ; the safety we have here to re-use instance is right now only because of the tests
  this.store = stores[path.resolve(filename)];

  const options = this.options.store || {};
  // console.log(';; init-options ', options, leveldown);
  const db = options.db || leveldown;
  // console.log(';; init-db ', db);
  this.store = stores[path.resolve(filename)] =
    this.store && this.store.isOpen()
      ? this.store
      : levelup(encode(db(filename), options), options);
  this._pipe.resume();

  // if (!this.store || this.store.isClosed()) {
  //   console.warn(';; level-store workaround');
  //   this._pipe.pause();
  //   this._retrQueue.pause();
  //   this.store = stores[path.resolve(filename)] = levelup(
  //     filename,
  //     this.options.store || {},
  //   );
  //   const self = this;
  //   this.store.on('open', function () {
  //     self._pipe.resume();
  //     self._retrQueue.resume();
  //   });
  // } else {
  //   this._pipe.resume();
  //   this._retrQueue.resume();
  // }
};

/**
 * Re-load the database by rebuilding indexes
 */
Model.prototype.reload = function (cb) {
  const self = this;
  self.emit('reset');
  this.resetIndexes();
  this._pipe.push(this.buildIndexes.bind(this), function () {
    cb(null);
    self.emit('reload');
  });
};

/**
 * Build new indexes from a full scan
 */
Model.prototype.buildIndexes = function (cb) {
  const self = this;

  const toBuild = _.filter(self.indexes, function (idx) {
    // @ts-expect-error fix-types
    return !idx.ready;
  });
  if (!toBuild.length)
    return setTimeout(function () {
      cb(null);
    });

  // Rebuild the new indexes
  _.each(toBuild, function (idx) {
    // @ts-expect-error fix-types
    idx.reset();
  });

  self.emit('indexesBuild', toBuild);

  self.store
    .createReadStream()
    .on('error', function (err) {
      cb(err);
    })
    .on('data', function (data) {
      console.log(';; buildIdx-data ', typeof data.value, data);

      const doc = schemas.construct(
        document.deserialize(data.value),
        self.schema,
      );
      self.emit('construct', doc);
      self.emit('indexesConstruct', doc, toBuild);
      _.each(toBuild, function (idx) {
        try {
          // @ts-expect-error fix-types
          idx.insert(doc);
        } catch (e) {}
      });
    })
    .on('end', function () {
      _.each(toBuild, function (idx) {
        // @ts-expect-error fix-types
        idx.ready = true;
      });
      self.emit('indexesReady', toBuild);
      cb(null);
    });
};

/**
 * Get an array of all the data in the database
 */
Model.prototype.getAllData = function () {
  return this.indexes._id.getAll();
};

/**
 * Reset all currently defined indexes
 */
Model.prototype.resetIndexes = function () {
  const self = this;
  Object.keys(this.indexes).forEach(function (i) {
    self.indexes[i].reset();
  });
};

/**
 * Ensure an index is kept for this field. Same parameters as lib/indexes
 * For now this function is synchronous, we need to test how much time it takes
 * We use an async API for consistency with the rest of the code
 * @param {String} options.fieldName
 * @param {Boolean} options.unique
 * @param {Boolean} options.sparse
 * @param {Function} cb Optional callback, signature: err
 */
Model.prototype.ensureIndex = function (options, cb) {
  const callback = cb || function () {};

  options = options || {};

  if (!options.fieldName) {
    return callback({ missingFieldName: true });
  }
  if (this.indexes[options.fieldName]) {
    return callback(null);
  }

  this.indexes[options.fieldName] = new Index(options);

  callback(null);
};

/**
 * Remove an index
 * @param {String} fieldName
 * @param {Function} cb Optional callback, signature: err
 */
Model.prototype.removeIndex = function (fieldName, cb) {
  const callback = cb || function () {};

  delete this.indexes[fieldName];
  callback(null);
};

/**
 * Add one or several document(s) to all indexes
 */
Model.prototype.addToIndexes = function (doc) {
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
};

/**
 * Remove one or several document(s) from all indexes
 */
Model.prototype.removeFromIndexes = function (doc) {
  const self = this;

  Object.keys(this.indexes).forEach(function (i) {
    self.indexes[i].remove(doc);
  });
};

/**
 * Update one or several documents in all indexes
 * To update multiple documents, oldDoc must be an array of { oldDoc, newDoc } pairs
 * If one update violates a constraint, all changes are rolled back
 */
Model.prototype.updateIndexes = function (oldDoc, newDoc) {
  let i;
  let failingIndex;
  let error;
  const keys = Object.keys(this.indexes);
  const skipId = (oldDoc && oldDoc._id) === (newDoc && newDoc._id);

  for (i = 0; i < keys.length; i += 1) {
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
};

/**
 * Insert a new document
 * @param {Function} cb Optional callback, signature: err, insertedDoc
 *
 */
Model.prototype.insert = function (newDoc, cb) {
  const callback = cb || function () {};
  const self = this;
  newDoc = (Array.isArray(newDoc) ? newDoc : [newDoc]).map(function (d) {
    return new self(d);
  });

  // This is a suboptimal way to do it, but wait for indexes to be up to date in order to avoid mid-insert index reset
  // We also have to ensure indexes are up-to-date
  self._pipe.push(this.buildIndexes.bind(this), function () {
    try {
      self._insertInIdx(newDoc);
    } catch (e) {
      return callback(e);
    }

    // Persist the document
    async.map(
      newDoc,
      function (d, cb) {
        self.emit('insert', d);
        d._persist(cb);
      },
      function (err, docs) {
        self.emit('inserted', docs);
        callback(err || null, err ? undefined : docs[0]);
      },
    );
  });
};

/**
 * Create a new _id that's not already in use
 */
Model.prototype.createNewId = function () {
  let tentativeId = hat(32);
  if (this.indexes._id.getMatching(tentativeId).length > 0) {
    tentativeId = this.createNewId();
  }
  return tentativeId;
};

/**
 * Prepare a document (or array of documents) to be inserted in a database - add _id and check them
 * @api private
 */
Model.prototype.prepareDocumentForInsertion = function (newDoc) {
  const self = this;

  (Array.isArray(newDoc) ? newDoc : [newDoc]).forEach(function (doc) {
    if (doc._id === undefined) doc._id = self.createNewId();
    document.checkObject(doc);
  });

  return newDoc;
};

/**
 * If newDoc is an array of documents, this will insert all documents in the cache
 * @api private
 */
Model.prototype._insertInIdx = function (newDoc) {
  if (Array.isArray(newDoc)) {
    this._insertMultipleDocsInIdx(newDoc);
  } else {
    this.addToIndexes(this.prepareDocumentForInsertion(newDoc));
  }
};

/**
 * If one insertion fails (e.g. because of a unique constraint), roll back all previous
 * inserts and throws the error
 * @api private
 */
Model.prototype._insertMultipleDocsInIdx = function (newDocs) {
  let i;
  let failingI;
  let error;
  const preparedDocs = this.prepareDocumentForInsertion(newDocs);
  for (i = 0; i < preparedDocs.length; i += 1) {
    try {
      this.addToIndexes(preparedDocs[i]);
    } catch (e) {
      error = e;
      failingI = i;
      break;
    }
  }

  if (error) {
    for (i = 0; i < failingI; i += 1) {
      this.removeFromIndexes(preparedDocs[i]);
    }

    throw error;
  }
};

/*
 * Beginning of the public functions
 *
 * Find a document by ID
 * This function is also used internally after looking up indexes to retrieve docs
 * @param {Object} ID
 */
Model.prototype.findById = function (id, callback) {
  return this.findOne({ _id: id }, callback);
};

/**
 * Count all documents matching the query
 * @param {Object} query MongoDB-style query
 */
Model.prototype.count = function (query, callback, quiet) {
  const cursor = new Cursor(this, query);
  cursor._quiet = quiet; // Used in special circumstances, such as sync
  if (typeof callback === 'function') cursor.count(callback);
  return cursor;
};

/**
 * Find all documents matching the query
 * If no callback is passed, we return the cursor so that user can limit, skip and finally exec
 * @param {Object} query MongoDB-style query
 */
Model.prototype.find = function (query, callback, quiet) {
  const cursor = new Cursor(this, query, function (err, docs, callback) {
    return callback(err ? err : null, err ? undefined : docs);
  });

  cursor._quiet = quiet; // Used in special circumstances, such as sync

  if (typeof callback === 'function') cursor.exec(callback);
  return cursor;
};

/**
 * Find one document matching the query
 * @param {Object} query MongoDB-style query
 */
Model.prototype.findOne = function (query, callback) {
  const cursor = new Cursor(this, query, function (err, docs, callback) {
    if (err) {
      return callback(err);
    }
    return callback(null, docs.length ? docs[0] : null);
  });

  if (typeof callback === 'function') cursor.exec(callback);
  return cursor;
};

/**
 * Live query shorthand
 * @param {Object} query MongoDB-style query
 */
Model.prototype.live = function (query) {
  return this.find(query).live();
};

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
Model.prototype.update = function (query, updateQuery, options, cb) {
  let callback;
  const self = this;
  let multi;
  let upsert;
  let err;

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  callback = _.once(cb || function () {});
  multi = options.multi !== undefined ? options.multi : false;
  upsert = options.upsert !== undefined ? options.upsert : false;

  const stream = Cursor.getMatchesStream(self, query);
  stream.on('error', function (e) {
    err = e;
    stream.close();
    callback(err);
  });
  stream.on('ids', function (ids) {
    const indexed = ids._indexed;

    // Special case - upsert and no found docs, which means we do an insert
    if (upsert && !ids.length) {
      let toBeInserted;

      if (typeof updateQuery === 'function') {
        // updateQuery is a function, we have to initialize schema from query
        toBeInserted = new self(document.deepCopy(query, true));
        updateQuery(toBeInserted);
      } else {
        try {
          document.checkObject(updateQuery);
          // updateQuery is a simple object with no modifier, use it as the document to insert
          toBeInserted = updateQuery;
        } catch (e) {
          // updateQuery contains modifiers, use the find query as the base,
          // strip it from all operators and update it according to updateQuery
          try {
            toBeInserted = document.modify(
              document.deepCopy(query, true),
              updateQuery,
            );
          } catch (e) {
            stream.close();
            callback(e);
          }
        }
      }

      return self.insert(toBeInserted, function (err, newDoc) {
        if (err) {
          return callback(err);
        }
        return callback(null, 1, newDoc);
      });
    }

    // Go on with our update; treat the error handling gingerly
    const modifications = [];
    stream.on('data', function (data) {
      try {
        if (!indexed && !document.match(data.val(), query)) return; // Not a match, ignore
      } catch (e) {
        err = e;
        stream.close();
        return;
      }

      try {
        const val = data.lock(); // we're doing a modification, grab the lock - ensures we get the safe reference to the object until it's unlocked

        if (typeof updateQuery === 'function') {
          updateQuery(val);
          if (data.id != val._id) throw 'update function cannot change _id';
          data.newDoc = val;
        } else data.newDoc = document.modify(val, updateQuery);

        data.oldDoc = val.copy();
        _.extend(val, data.newDoc); // IMPORTANT: don't update on .modify, in case we emit an error while modifying
        modifications.push(data);

        if (!multi) stream.close(); // Not a multi update, close after one valid modification
      } catch (e) {
        err = e;
        stream.close();
        data.unlock();
        return;
      }
    });

    stream.on('ready', function () {
      if (err) return callback(err);

      // Change the docs in memory
      try {
        self.updateIndexes(modifications);
      } catch (e) {
        return callback(e);
      }

      // Persist document
      async.map(
        modifications,
        function (d, cb) {
          new self(d.newDoc)._persist(function (e, doc) {
            d.unlock();
            cb(e, doc);
          });
        },
        function (e, docs) {
          if (docs) self.emit('updated', docs);

          callback(
            e || null,
            e ? undefined : docs.length,
            !e && docs.length ? docs[0] : undefined,
          );
        },
      );
    });
  });
};

/**
 * Save a document - insert it into the DB or update in-place
 * @param {Object} document
 */
Model.prototype.save = function (docs, cb, quiet) {
  const self = this;
  cb = cb || function () {};

  docs = (Array.isArray(docs) ? docs : [docs]).map(function (d) {
    return d.constructor.modelName == self.modelName ? d : new self(d);
  });
  this.prepareDocumentForInsertion(docs);

  const existingDocs = {};
  const stream = Cursor.getMatchesStream(this, {
    _id: { $in: _.chain(docs).map('_id').compact().value() },
  });
  stream.on('error', function (err) {
    stream.close();
    cb(err);
  });
  stream.on('data', function (d) {
    existingDocs[d.id] = d.val();
  });
  stream.on('ready', function () {
    const insert = [];
    const modifications = [];
    docs.forEach(function (d) {
      modifications.push({ oldDoc: existingDocs[d._id], newDoc: d });
    });

    try {
      self.updateIndexes(modifications);
    } catch (err) {
      return cb(err);
    }

    async.each(
      modifications,
      function (m, cb) {
        if (!m.oldDoc && !quiet) self.emit('insert', m.newDoc);
        m.newDoc._persist(cb, quiet);
      },
      function (err) {
        if (err) return cb(err);

        const inserted = modifications
          .filter(function (x) {
            return !x.oldDoc;
          })
          .map(function (x) {
            return x.newDoc;
          });
        const updated = modifications
          .filter(function (x) {
            return x.oldDoc;
          })
          .map(function (x) {
            return x.newDoc;
          });
        if (inserted.length) self.emit('inserted', inserted, quiet);
        if (updated.length) self.emit('updated', updated, quiet);

        cb(null, docs.length <= 1 ? docs[0] : docs, {
          inserted: inserted.length,
          updated: updated.length,
        });
      },
    );
  });
};

/**
 * Remove all docs matching the query
 * For now very naive implementation (similar to update)
 * @param {Object} query
 * @param {Object} options Optional options
 *                 options.multi If true, can update multiple documents (defaults to false)
 * @param {Function} cb Optional callback, signature: err, numRemoved
 *
 * @api private Use Model.remove which has the same signature
 */
Model.prototype.remove = function (query, options, cb) {
  let callback;
  const self = this;
  const removed = [];
  let err;

  if (typeof options === 'function') {
    cb = options;
    options = {};
  }
  callback = cb || function () {};
  const multi = options.multi !== undefined ? options.multi : false;

  const stream = Cursor.getMatchesStream(this, query);
  let indexed;
  stream.on('ids', function (ids) {
    indexed = ids._indexed;
  });
  stream.on('data', function (d) {
    try {
      const v = d.val();
      if (
        (indexed || document.match(v, query)) &&
        (multi || removed.length === 0)
      ) {
        removed.push(v._id);
        self.removeFromIndexes(v);
        self.emit('remove', v);
      }
    } catch (e) {
      err = e;
    }
  });
  stream.on('ready', function () {
    if (err) return callback(err);

    // Persist in LevelUP; do this after error check
    async.each(
      removed,
      function (id, cb) {
        self.store.del(id, cb);
      },
      function (e) {
        self.emit('removed', removed);
        callback(e || null, e ? undefined : removed.length);
      },
    );
  });
  stream.on('error', function (e) {
    stream.close();
    callback(e);
  });
};

Model.Cursor = Cursor;
