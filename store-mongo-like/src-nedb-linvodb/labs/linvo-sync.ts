import async from 'async';
import _ from 'lodash';
import type { Model } from '../src';

export function setupSync(
  model: { linvoSync: boolean; } & Model,
  api: {
    user?: { _id: any };
    request?: any;
  },
  options: {
    log: any;
    debounce: any;
    remoteCollection: any;
    limitPerSync: number;
  },
) {
  if (model.linvoSync) return;
  model.linvoSync = true;
  const log = (s) => options.log && console.log('LinvoDB Sync: ' + s);

  /** true only if sync is in progress */
  let dirty = false;
  const triggerSync = _.debounce((cb = () => { }) => {
    dirty = true;
    queue.push({}, cb);
  }, options.debounce || 500);

  model.on('updated', (items, quiet) => {
    if (!quiet) triggerSync();
  });
  model.on('inserted', (items, quiet) => {
    if (!quiet) triggerSync();
  });
  // model.static('triggerSync', triggerSync);

  /** 每次本地save或construct时，会添加到本Map */
  let mtimes = {};
  model.on('reset', () => {
    mtimes = {};
  });
  model.on('refresh', () => {
    triggerSync();
  });
  model.on('construct', (x) => {
    if (x._id && x._mtime) mtimes[x._id] = x._mtime;
  });
  model.on('save', (x) => {
    if (x._id && x._mtime) mtimes[x._id] = x._mtime;
  });

  /** We need to run only one task at a time
   * - queue对象的每个task执行都会经历worker方法
   * - http://caolan.github.io/async/v3/docs.html#queue
   */
  const queue = async.queue((opts, cb) => {
    if (!api.user) return cb();
    if (!dirty) return cb();

    const baseQuery = {
      collection: options.remoteCollection || model.modelName,
    };

    /** 存放远程变更元数据，{ id: datetime } */
    const remote = {};
    let push: any[] = [];
    let pull: any[] = [];

    const userId = api.user._id;
    const checkUid = () => (api.user && api.user._id) === userId;

    log('sync started for ' + model.modelName);

    async.auto(
      {
        ensure_indexes: (callback) => {
          // Meaningless lookup to Ensure the DB has been indexed
          if (!checkUid())
            return callback(new Error('uid changed while syncing'));
          model.count({}, (err, c) => callback(), true);
        },
        retrieve_remote: (callback) => {
          if (!checkUid())
            return callback(new Error('uid changed while syncing'));

          api.request('datastoreMeta', baseQuery, (err, meta) => {
            if (err) return callback(err);
            meta.forEach((m) => {
              remote[m[0]] = new Date(m[1]).getTime();
            });
            callback();
          });
        },
        compile_changes: [
          'ensure_indexes',
          'retrieve_remote',
          (callback) => {
            if (!checkUid()) {
              // @ts-expect-error fix-types
              return callback(new Error('uid changed while syncing'));
            }

            const pushIds: any[] = [];
            Object.keys(mtimes).forEach((id) => {
              const mtime = mtimes[id];
              if ((remote[id] || 0) > mtime.getTime()) pull.push(id);
              if ((remote[id] || 0) < mtime.getTime()) pushIds.push(id);
              delete remote[id]; // already processed
            });

            pull = pull.concat(Object.keys(remote)); // add all non-processed to pull queue

            model.find(
              { _id: { $in: pushIds } },
              (err, res) => {
                // @ts-expect-error fix-types
                if (err) return callback(err);

                push = res;
                // @ts-expect-error fix-types
                callback();
              },
              true,
            );

            // It's correct to mark the DB before commiting the changes, but when compiling the list of changes
            // Until the changes are committed, more changes might occur
            dirty = false;
          },
        ],
        push_remote: [
          'compile_changes',
          (callback) => {
            if (!checkUid())
              // @ts-expect-error fix-types
              return callback(new Error('uid changed while syncing'));

            if (push.length)
              log(
                'pushing ' +
                push.length +
                ' changes to remote for ' +
                model.modelName,
              );

            // @ts-expect-error fix-types
            if (!push.length) return callback();

            api.request(
              'datastorePut',
              _.extend({}, baseQuery, {
                changes: push.map((x) => {
                  const item = _.extend({}, x);
                  if (x._mtime) x._mtime = x._mtime.getTime();
                  if (x._ctime) x._ctime = x._ctime.getTime();
                  return item;
                }),
              }),
              callback,
            );
          },
        ],
        pull_local: [
          'compile_changes',
          (callback) => {
            if (!checkUid())
              // @ts-expect-error fix-types
              return callback(new Error('uid changed while syncing'));

            // @ts-expect-error fix-types
            if (!pull.length) return callback();

            if (options.limitPerSync)
              pull = pull.slice(0, options.limitPerSync);

            api.request(
              'datastoreGet',
              _.extend({}, baseQuery, { ids: pull }),
              (err, results) => {
                // @ts-expect-error fix-types
                if (err) return callback(err);

                if (results.length)
                  log(
                    'pulled ' + results.length + ' down for ' + model.modelName,
                  );

                const byId = {};
                results = results
                  .map((x) => {
                    if (byId[x._id]) return;
                    byId[x._id] = true;
                    x._ctime = new Date(x._ctime || 0);
                    x._mtime = new Date(x._mtime || 0);
                    return x;
                  })
                  .filter((x) => x);

                if (!checkUid())
                  // @ts-expect-error fix-types
                  return callback(new Error('uid changed while syncing'));

                // pull到本地的数据必须包含完整内容
                model.save(
                  results,
                  (err) => {
                    if (err) console.error(err);
                    // @ts-expect-error fix-types
                    callback();

                    if (results.length) model.emit('liveQueryRefresh');
                  },
                  true,
                ); // True for quiet mode, not emit any events
              },
            );
          },
        ],
        finalize: [
          'push_remote',
          'pull_local',
          (callback) => {
            log('sync finished for ' + model.modelName);

            model.emit('syncFinished');

            // @ts-expect-error fix-types
            callback();
          },
        ],
      },
      (err) => {
        if (err) console.error(err);
        cb();
      },
    );
  }, 1);
}
