import _ from 'lodash';

import * as docUtils from './document';
import type { Model } from './model';
import { EventEmitter } from './utils/event-emitter';

const INDEX_BUILDING_DEBOUNCE = 10;
const LIVE_QUERY_DEBOUNCE = 30;
const AUTO_INDEXING = true;

/**
 * Manage access to data, be it to find, update or remove it
 */
export class Cursor {
  db: Model;
  query: Record<string, any>;
  /** cb to be executed after _aggregate in {@link Cursor#exec} ready func */
  execFn: (...args: any[]) => any;
  _limit: any;
  _skip: any;
  _filter: any;
  _sort: any;
  _map: any;
  _reduce: any[];
  _aggregate: (...args: any[]) => any;
  _quiet: boolean;
  _count: boolean;
  _live: any;
  _ondata: any;
  _ids: Record<string, any>;
  res: any;
  _prefetched: any;
  stop: (...args: any[]) => any;
  refresh: (...args: any[]) => any;

  /**
   * Create a new cursor for this collection
   * @param {Model} db - The datastore this cursor is bound to
   * @param {Query} query - The query this cursor will operate on
   * @param {Function} execDn - Handler to be executed after cursor has found the results and before the callback passed to find/findOne/update/remove
   */
  constructor(db: Model, query = undefined, execFn = undefined) {
    this.db = db;
    this.query = query || {};
    if (execFn) {
      this.execFn = execFn;
    }
  }

  /**
   * Set a limit to the number of results
   */
  limit(limit) {
    this._limit = limit;
    return this;
  }

  /**
   * Skip a the number of results
   */
  skip(skip) {
    this._skip = skip;
    return this;
  }

  /**
   * Filter the results of the query - must be a function
   */
  filter(filter) {
    if (typeof filter !== 'function') return this;
    this._filter = filter;
    return this;
  }
  /**
   * Re-define the query itself; used for live queries
   */
  find(query) {
    this.query = query || this.query;
    return this;
  }

  /**
   * Sort results of the query
   * @param {SortQuery} sortQuery - SortQuery is { field: order }, field can use the dot-notation, order is 1 for ascending and -1 for descending
   */
  sort(sortQuery) {
    this._sort = sortQuery;
    return this;
  }

  /**
   * Add the use of a mapping function
   * @param {Function} map - map function, takes the object as the first argument
   */
  map(map) {
    if (typeof map === 'function') this._map = map;
    return this;
  }
  /**
   * Add the use of a reducing function
   * @param {Function} reduce - reduce function, takes the two objects
   */
  reduce(reduce, initial = undefined) {
    if (typeof reduce === 'function') {
      this._reduce = initial === undefined ? [reduce] : [reduce, initial];
    }
    return this;
  }

  /**
   * Aggregating function
   */
  aggregate(aggr) {
    this._aggregate = aggr;
    return this;
  }

  /**
   * Get all matching elements
   * - Will return pointers to matched elements (shallow copies), returning full copies is the role of find or findOne
   *
   * @param {Function} callback - Signature: err, results
   */
  exec(callback) {
    let res = [] as any;
    const resIds = {};
    const resById = {};
    let err = null;
    let sort;
    let sorter;
    if (typeof this._sort === 'function') sorter = this._sort;
    else sort = this._sort;

    let reducer;
    if (this._reduce) reducer = [].concat(this._reduce);
    // we have to copy the initial value, so that we don't inherit old vals
    if (reducer && reducer[1]) reducer[1] = docUtils.deepCopy(this._reduce[1]);

    if (!this._quiet) this.db.emit('query', this.query); // no handler

    const stream = Cursor.getMatchesStream(
      this.db,
      this.query,
      sort,
      this._prefetched,
    );
    stream.on('error', (e) => callback(e));
    stream.removeListener('ids', stream.trigger); // ❓ why removed so quickly

    // register events for data/ready; trigger when index built and ids found
    stream.on('ids', (ids) => {
      const indexed = ids._indexed;
      // for some reason we cannot access those in on 'ready' - maybe properties get erased from arrays?
      const sorted = ids._sorted;
      // query is indexed, sorter and we don't have special filter/sort funcs; TODO: we should also set this to true if there's no limit/skip
      const earlyLimit = indexed && sorted && !this._filter && !sorter;
      // If ids are already sorted
      const earlySort = (sorted || !sort) && !sorter;
      // special mode - run the map/reduce directly on data event
      const earlyMapReduce = earlyLimit && earlySort && this._map && reducer;
      // TODO: earlyMapReduce even without the map
      if (earlyLimit) {
        ids = limit(ids, this._limit || ids.length, this._skip || 0);
      }

      // No need to go further, sort and limits are applied, we only need count
      if (earlyLimit && this._count) {
        res = ids;
        return ready();
      }

      // Start retrieving the objects for those IDs; res is an array that will hold all results
      stream.trigger(ids); // go to {@link getMatchesStream}
      res = new Array(ids.length);

      // Special case: res becomes the cursor of reduce if we're running a map/reduce
      if (earlyMapReduce) res = reducer[1] || undefined;

      // Error catcher
      const catcher = (e) => {
        stream.close();
        err = e;
        res = undefined;
      };

      stream.on('data', (d) => {
        let val = d.val();

        // Check documents for match if query is not full-index
        if (!indexed && !docUtils.match(val, this.query)) return;

        // WARNING: maybe we can put this entire block in try-catch but then we have to make absolutely sure that we're not going to throw errors
        // and the only place it can come from is _filter, _map or reducer

        try {
          if (this._filter && !this._filter(val)) return; // Apply filter
        } catch (e) {
          catcher(e);
        }

        if (this._live) {
          resById[val._id] = val;
          resIds[val._id] = true;
        } // Keep those in a map if we need them for a live query

        if (earlyMapReduce) {
          // The early map-reduce system, map/reduce-es results on the go if we can (results are pre-sorted and limited)
          try {
            val = this._map(val);
            res = res === undefined ? val : reducer[0](res, val);
          } catch (e) {
            catcher(e);
          }
          return;
        }

        if (res) res[d.idx] = val; // res might have been set to undefined because of an error

        if (this._ondata) this._ondata(val);
      });

      stream.on('ready', () => {
        if (err) return ready();

        if (this._live) {
          this._ids = resIds; // We need those for the live query
        }
        // also keep this on a regular cursor; no harm done, it will be released once the cursor is let go
        this._prefetched = resById;

        if (earlyMapReduce) return ready();

        try {
          // Remove holes left by document.match/filter
          res = res.filter((x) => x !== null);

          if (!earlySort) res = res.sort(sorter || Cursor.getSorter(sort));
          if (!earlyLimit) {
            res = limit(res, this._limit || res.length, this._skip || 0);
          }

          if (this._map) res = res.map((v) => this._map(v));
          if (reducer) res = res.reduce.apply(res, reducer);
        } catch (e) {
          err = e;
          res = undefined;
        }

        ready();
      });
    });

    const limit = (res, limit, skip) => {
      return res.slice(skip, limit + skip);
    };
    /** this._aggregate, then trigger Cursor constructor cb fn */
    const ready = () => {
      if (res && this._count) res = res.length;
      if (res && this._aggregate) res = this._aggregate(res);

      if (typeof this.execFn === 'function') {
        return this.execFn(err, res, callback);
      } else {
        return callback(err, res);
      }
    };
  }

  count(callback = undefined) {
    this._count = true;
    if (callback) this.exec(callback);
    return this;
  }

  /** Make the cursor into a live query, and trigger an async {@link Cursor#exec}  */
  live(query = undefined) {
    if (query !== undefined) this.query = query;
    if (this._live) {
      // Live query already initialized; refresh
      this.refresh();
      return this;
    }

    this._live = true;
    this._ids = {};
    this._prefetched = {};
    this.res = undefined;

    /** Refresh live query and do {@link Cursor#exec}, `this.refresh = refresh;` */
    const refresh = (callback = undefined) => {
      // const refresh = _.debounce((callback = undefined) => {
      // debugger;
      this.exec((err, res) => {
        if (err) console.error(err); // No other way for now
        this.res = res;
        this.db.emit('liveQueryUpdate', this.query);
        if (typeof callback === 'function') callback();
      });
    };
    // }, this.db.options.liveQueryDebounce || LIVE_QUERY_DEBOUNCE);
    refresh(); // trigger an async exec now

    /** Watch for changes */
    const updated = (docs) => {
      // Refresh if any of the objects: have an ID which is in our results OR they match our query (this.query)
      let shouldRefresh = false;
      docs.forEach((doc) => {
        // Avoid using .some since it would stop iterating after first match and we need to set _prefetched
        const interested =
          this._count || this._ids[doc._id] || docUtils.match(doc, this.query); // _count queries never set _ids
        if (interested) this._prefetched[doc._id] = doc;
        shouldRefresh = shouldRefresh || interested;
      });
      if (shouldRefresh) refresh();
    };

    const removed = (ids) => {
      // Refresh if any of the objects: have an ID which is in our results
      if (
        ids.some((id) => {
          return this._ids[id];
        })
      )
        refresh();
    };

    const stop = () => {
      this._live = false;
      delete this.refresh;
      delete this.stop;

      this.db.removeListener('updated', updated);
      this.db.removeListener('inserted', updated);
      this.db.removeListener('removed', removed);
      this.db.removeListener('reload', refresh);
      this.db.removeListener('liveQueryRefresh', refresh);
    };

    this.db.on('updated', updated);
    this.db.on('inserted', updated);
    this.db.on('removed', removed);
    this.db.on('reload', refresh); // Refresh on DB reload
    this.db.on('liveQueryRefresh', refresh); // Refresh on this event

    this.refresh = refresh;
    this.stop = stop;

    return this;
  }

  /** streaming cursor */
  stream(ondata, callback) {
    this._ondata = ondata;
    this.exec(callback);
  }

  /** Static methods, we don't want to expose those; 依赖 Cursor.getIdsForQuery
   *
   * - getMatchesStream - gets an event emitter that streams results from a query, all retrieved through indexes
   * - most queries can be fulfilled only via an index lookup
   * - this function, besides doing the query, makes sure that indexes are built for it before (auto-indexing)
   *
   * - prefetched - a hash map of ID->constructed object which we have pre-fetched somehow - previous results from a live query
   * @return new EventEmitter obj, a new obj for every func call
   */
  static getMatchesStream(
    db: Model,
    query,
    sort = undefined,
    prefetched = undefined,
  ) {
    sort = sort || {};
    const stream = new EventEmitter() as any;
    stream._closed = false;
    stream._waiting = null;

    stream.close = () => {
      stream._closed = true;
    };

    // Retrieve IDs of the documents matched by the query;
    // push to the pipe so we wait for existing index building to finish
    setTimeout(
      (cb) => {
        try {
          // debugger;
          // If the query fails, it will happen now, no need to re-catch it later
          const ids = Cursor.getIdsForQuery(db, query, sort);
          if (ids) return stream.emit('ids', ids);
        } catch (e) {
          return stream.emit('error', e);
        }

        // if getIdsForQuery returns null, then we have to re-build indexes
        //  Insert a simple timeout if the queue is empty in order to do debouncing
        if (
          db._pipe.queue.length === 0 &&
          Object.keys(db.indexes).some((key) => !db.indexes[key].ready)
        ) {
          db._pipe.push(
            (cb) => {
              setTimeout(
                cb,
                db.options.indexBuildingDebounce || INDEX_BUILDING_DEBOUNCE,
              );
            },
            () => undefined,
          );
        }

        db._pipe.push(db.buildIndexes.bind(db), () => {
          const ids = Cursor.getIdsForQuery(db, query, sort);
          if (ids) {
            stream.emit('ids', ids); // 👈🏻 emitEvent ids
          } else {
            stream.emit(
              'error',
              new Error('getIdsForQuery returned null after index building'),
            );
          }
        });
      },
      0,
      () => {},
    );

    // Stream the documents themselves: push all to the retriever queue
    // 👈🏻 onEvent ids; fired from build Indexes cb
    stream.on(
      'ids',
      (stream.trigger = (ids) => {
        stream._waiting = ids.length;
        // debugger;
        if (!ids.length) {
          // ready event is handled in Model.save, updateIndexes
          return setTimeout(() => stream.emit('ready'));
        }

        ids.forEach((id, i) => {
          db._reTrQueue.push((cb) => {
            // todo perf time reduce
            // If db.store.isClosed(), then bagpipe.stop() has been called. So we shouldn't be in this state.
            //if (db.store.isClosed()) return cb();
            Cursor.retriever(
              {
                db: db,
                stream: stream,
                id: id,
                idx: i,
                prefetched: prefetched && prefetched[id],
              },
              () => {
                if (--stream._waiting === 0) stream.emit('ready'); // data is ready, goto cursor exec end
                cb();
              },
            );
          });
        });
      }),
    );

    return stream;
  }

  /** get id from persistence storage */
  static retriever(task, cb) {
    const locked = task.db._reTrQueue._locked;
    const locks = task.db._reTrQueue._locks;

    if (task.stream._closed) return cb();

    if (task.prefetched) {
      return setTimeout(() => {
        task.stream.emit('data', {
          id: task.id,
          idx: task.idx,
          val: () => task.prefetched,
          lock: () => undefined,
          unlock: () => undefined,
        });
        return cb();
      });
    }

    task.db.store.get(task.id, (err, value) => {
      if (task.stream._closed) return cb();

      // quietly ignore that one for now, since it's possible to do a .remove while a query is happening
      // ugly workaround; TODO: fix
      if (err && err.type === 'NotFoundError') return cb();

      if (err) {
        task.stream.emit('error', err);
      } else {
        // console.log(';; getVal ', value);

        if (value === undefined) value = {};
        if (typeof value === 'string') value = docUtils.deserialize(value);
        // ? check missing `new task.db` logic, schemas.construct

        const emitData = {
          id: task.id,
          idx: task.idx,
          // val: () => new task.db(value),
          val: () => value,
          lock: () => {
            if (!locks.hasOwnProperty(task.id)) locks[task.id] = 0;
            locks[task.id]++;
            return (locked[task.id] = locked[task.id] || emitData.val());
          },
          unlock: () => {
            locks[task.id]--;
            if (!locks[task.id]) {
              delete locks[task.id];
              delete locked[task.id];
            }
          },
        };
        task.stream.emit('data', emitData);
      }

      cb();
    });
  }

  /**
   * Run a complex query on indexes and return results
   * @internal
   */
  static getIdsForQuery(db: Model, query, sort = undefined) {
    const self = db;

    // Comparison operators: $lt $lte $gt $gte $in $nin $ne $regex $exists - all implemented
    // Logical operators: $or $and $not - all implemented

    // TODO: think about performance, how to minimize calls to _.union and _.intersection
    // best way to go would be lazy evaluation

    /** Is query fully indexed */
    let indexed = true;
    /** Query is sorted */
    let sorted = true;
    /** Query can be indexed */
    let indexable = true;

    let res = null;
    let excludes = [];

    /** Push to results with `.intersection` */
    const push = (x) => {
      res = res ? _.intersection(res, x) : _.uniq(x);
    };
    const exclude = (x) => {
      excludes = _.union(excludes, x);
    };

    // TODO; change the logic here when we have compound indexes
    // const firstKey = _.first(_.keys(sort));
    const firstKey = sort ? Object.keys(sort)[0] : undefined; // 👀 same as above
    // console.log(';; firstKey-sort ', firstKey, sort)
    sorted = firstKey
      ? // Boolean(db.indexes[firstKey]) && _.keys(sort).length === 1
        Boolean(db.indexes[firstKey]) && Object.keys(sort).length === 1
      : true;

    /** handle $and/$or, then db.ensureIndex to build index, then handle $lt/$gt */
    const match = (key: string, val) => {
      // Handle logical operators
      if (key.charAt(0) === '$') {
        // if (key[0] === '$') {
        if (key === '$and' || key === '$or') {
          if (!Array.isArray(val)) {
            throw new Error(key + ' operator used without an array');
          }

          const i = val.map((q) => {
            return Cursor.getIdsForQuery(db, q);
          });
          const fn = key === '$and' ? _.intersection : _.union; // Merging function

          if (i.indexOf(null) > -1) {
            indexed = false;
          } else if (
            _.findIndex(i, (o) => {
              return !o || !o._indexed;
            }) > -1
          ) {
            indexable = false;
          } else {
            push(fn.apply(null, i));
          }
        }

        if (key === '$not') {
          const i = Cursor.getIdsForQuery(db, val);

          if (i === null) indexed = false;
          else exclude(i);
        }

        // TODO: emit error here on "else"
        return;
      }

      // Adding support for non-indexed $elemMatch for now.
      // FIXME Add support for indexed $elemMatch queries.
      if (val && val.hasOwnProperty('$elemMatch')) {
        indexable = false;
        return;
      }
      // Handle case of "{ $not: { $elemMatch: <query> } }"
      if (val && val.hasOwnProperty('$not')) {
        const notQuery = val.$not;
        if (notQuery.hasOwnProperty('$elemMatch')) {
          indexable = false;
          return;
        }
      }

      // The query is not fully indexed - set the flag and build the index
      if (!(db.indexes[key] && db.indexes[key].ready)) {
        indexed = false;
        if (db.options.autoIndexing) {
          db.ensureIndex({ fieldName: key }); // add index with ready `false`
        }
      }

      // 1) We can utilize this index and 2) we should
      const index = db.indexes[key];
      if (index && (indexed || !db.options.autoIndexing)) {
        if (val === undefined) return push(index.getAll()); // Useful when we invoke match() in sort loop
        if (docUtils.isPrimitiveType(val)) return push(index.getMatching(val));

        if (
          typeof val === 'object' &&
          !Object.keys(val).some((k) => docUtils.comparators[k])
        )
          return push(index.getMatching(val));

        // Those can be combined
        if (val && val.hasOwnProperty('$ne')) {
          exclude(index.getMatching(val.$ne));
        }
        if (val && val.hasOwnProperty('$in')) {
          push(index.getMatching(val.$in));
        }
        if (val && val.hasOwnProperty('$nin')) {
          exclude(index.getMatching(val.$nin));
        }
        if (
          (val && val.hasOwnProperty('$lt')) ||
          val.hasOwnProperty('$lte') ||
          val.hasOwnProperty('$gt') ||
          val.hasOwnProperty('$gte')
        ) {
          push(index.getBetweenBounds(val));
        }
        if (val && val.hasOwnProperty('$exists') && val.$exists == true) {
          push(
            index.getAll(function (n) {
              return n.key !== undefined;
            }),
          );
        }
        if (val && val.hasOwnProperty('$exists') && val.$exists == false) {
          push(
            index.getAll(function (n) {
              return n.key === undefined;
            }),
          );
        }
        if (val && val.hasOwnProperty('$regex')) {
          const r = val.$regex;
          push(
            index.getAll(function (n) {
              return n.key && n.key.match(r);
            }),
          );
        }
      }
    };

    if (sort) {
      Object.keys(sort).forEach((key) => {
        const value = sort[key];
        match(key, query[key]); // If there's no query key, the value will be undefined

        if (!sorted) return; // We need this to be active in order to avoid empty res

        // Flip results, descending order
        if (key === firstKey && value === -1 && res) {
          res = res.reverse();
        }

        // Apply all the sort keys first, effectively allowing results to be sorted by first sort key
        // In order to implement compound sort here, we need compound indexes
      });
    }

    // Match all keys in the query except the sort keys, since we've done this already in the sort loop
    Object.keys(query).forEach((key) => {
      if (sort && sort[key]) return;
      const value = query[key];
      // console.log(';; cursor-getIds-match ', query, key, value);
      match(key, value);
    });

    if (indexable && !indexed && db.options.autoIndexing) return null; // indexes not ready
    if (!res && !db.indexes._id.ready) return false;

    res = _.difference(res || self.getAllData(), excludes);
    res._indexed = indexable && indexed;
    res._sorted = sorted;
    return res;
  }

  /**
   * Internal function to help sorting in case `getIdsForQuery` doesn't return sorted results
   */
  private static getSorter(sort) {
    // const criteria = _.map(sort, (val, key) => ({ key: key, direction: val }));
    const criteria = Object.keys(sort).map((key) => ({
      key,
      direction: sort[key],
    }));
    return (a, b) => {
      let criterion;
      let compare;
      let i;
      for (i = 0; i < criteria.length; i++) {
        criterion = criteria[i];
        compare =
          criterion.direction *
          docUtils.compareThings(
            docUtils.getDotValue(a, criterion.key),
            docUtils.getDotValue(b, criterion.key),
          );
        if (compare !== 0) return compare;
      }
      return 0;
    };
  }
}
