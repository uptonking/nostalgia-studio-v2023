import {
  clean,
  map,
  type MapCreator,
  type MapStore,
  onMount,
  startTask,
  task,
} from 'nanostores';

import { type SyncMapValues } from '@logux/actions';
import { type Action, isFirstOlder, type Meta } from '@logux/core';

import { type Client } from '../client/index';
import { LoguxUndoError } from '../logux-undo-error/index';
import { track } from '../track/index';
import { type SyncMapStore, type SyncMapTemplate } from './index.d';

function changeIfLast(store, fields, meta: any = undefined) {
  const changes = {};
  for (const key in fields) {
    if (!meta || isFirstOlder(store.lastChanged[key], meta)) {
      changes[key] = fields[key];
      if (meta) store.lastChanged[key] = meta;
    }
  }
  // eslint-disable-next-line guard-for-in
  for (const key in changes) {
    store.setKey(key, changes[key]);
  }
}

function getIndexes(plural, id) {
  return [plural, `${plural}/${id}`];
}

type MapStorePropsType = {
  plural?: any;
  client?: any;
  lastProcessed?: any;
  lastChanged?: any;
  isLoading?: any;
};

export function syncMapTemplate<Value extends SyncMapValues>(
  plural: string,
  opts: {
    offline?: boolean;
    remote?: boolean;
  } = {},
) {
  const Template: SyncMapTemplate<Value> & { filters?: any } = (
    id: string,
    ...args
  ) => {
    if (!Template.cache[id]) {
      // @ts-expect-error fix-types
      Template.cache[id] = Template.build(id, ...args);
    }
    return Template.cache[id];
  };

  Template.cache = {};

  // @ts-expect-error fix-types
  Template.build = (
    id: string,
    client: Client,
    createAction,
    createMeta,
    alreadySubscribed,
  ) => {
    const store: SyncMapStore<Value> & MapStorePropsType = map({
      id,
      isLoading: true,
    });

    onMount(store, () => {
      if (!client) {
        throw new Error('Missed Logux client');
      }

      function saveProcessAndClean(fields, meta) {
        // eslint-disable-next-line guard-for-in
        for (const key in fields) {
          if (isFirstOlder(store.lastProcessed[key], meta)) {
            store.lastProcessed[key] = meta;
          }
          store.client.log.removeReason(`${store.plural}/${id}/${key}`, {
            olderThan: store.lastProcessed[key],
          });
        }
      }

      store.plural = plural;
      store.client = client;
      store.offline = Template.offline;
      store.remote = Template.remote;

      store.lastChanged = {};
      store.lastProcessed = {};

      const deletedType = `${plural}/deleted`;
      const deleteType = `${plural}/delete`;
      const createdType = `${plural}/created`;
      const createType = `${plural}/create`;
      const changeType = `${plural}/change`;
      const changedType = `${plural}/changed`;
      const subscribe = { type: 'logux/subscribe', channel: `${plural}/${id}` };

      let loadingError;
      let isLoading = true;
      // @ts-expect-error fix-types
      store.setKey('isLoading', true);

      if (createAction) {
        // eslint-disable-next-line guard-for-in
        for (const key in createAction.fields) {
          // @ts-expect-error fix-types
          store.setKey(key, createAction.fields[key]);
          store.lastChanged[key] = createMeta;
        }
        isLoading = false;
        // @ts-expect-error fix-types
        store.loading = Promise.resolve();
        // @ts-expect-error fix-types
        store.setKey('isLoading', false);
        store.createdAt = createMeta;
        if (createAction.type === createType) {
          track(client, createMeta.id)
            .then(() => {
              saveProcessAndClean(createAction.fields, createMeta);
            })
            .catch(() => {});
        }
        if (store.remote && !alreadySubscribed) {
          client.log.add({ ...subscribe, creating: true }, { sync: true });
        }
      } else {
        const endTask = startTask();
        let loadingResolve;
        let loadingReject;
        // @ts-expect-error fix-types
        store.loading = new Promise((resolve, reject) => {
          loadingResolve = () => {
            resolve(undefined);
            endTask();
          };
          loadingReject = (e) => {
            reject(e);
            endTask();
          };
        });

        // eslint-disable-next-line no-inner-declarations
        async function processSubscribe(subscription) {
          await subscription
            .then(() => {
              if (isLoading) {
                isLoading = false;
                // @ts-expect-error fix-types
                store.setKey('isLoading', false);
                loadingResolve();
              }
            })
            .catch((e) => {
              loadingError = true;
              loadingReject(e);
            });
        }

        if (store.remote && !store.offline) {
          processSubscribe(client.sync(subscribe));
        }
        if (store.offline) {
          let found;
          let latestMeta;
          client.log
            .each({ index: `${plural}/${id}` }, (action, meta) => {
              const type = action.type;
              // @ts-expect-error fix-types
              if (action.id === id) {
                if (
                  type === changedType ||
                  type === changeType ||
                  type === createdType ||
                  type === createType
                ) {
                  if (latestMeta === undefined) {
                    latestMeta = meta;
                  } else if (isFirstOlder(meta, latestMeta)) {
                    latestMeta = meta;
                  }
                  // @ts-expect-error fix-types
                  changeIfLast(store, action.fields, meta);
                  found = true;
                } else if (type === deletedType || type === deleteType) {
                  return false;
                }
              }
              return undefined;
            })
            .then(async () => {
              if (found && isLoading && !store.remote) {
                isLoading = false;
                // @ts-expect-error fix-types
                store.setKey('isLoading', false);
                loadingResolve();
              } else if (!found && !store.remote) {
                loadingReject(
                  new LoguxUndoError({
                    type: 'logux/undo',
                    reason: 'notFound',
                    id: client.log.generateId(),
                    action: subscribe,
                  }),
                );
              } else if (store.remote) {
                const subscribeSinceLatest =
                  latestMeta !== undefined
                    ? {
                        ...subscribe,
                        since: { id: latestMeta.id, time: latestMeta.time },
                      }
                    : subscribe;
                await processSubscribe(client.sync(subscribeSinceLatest));
              }
            });
        }
      }

      const reasonsForFields = (action, meta) => {
        for (const key in action.fields) {
          if (isFirstOlder(store.lastProcessed[key], meta)) {
            meta.reasons.push(`${plural}/${id}/${key}`);
          }
        }
      };

      const removeReasons = () => {
        // eslint-disable-next-line guard-for-in
        for (const key in store.lastChanged) {
          client.log.removeReason(`${plural}/${id}/${key}`);
        }
      };

      const setFields = (action, meta) => {
        changeIfLast(store, action.fields, meta);
        saveProcessAndClean(action.fields, meta);
      };

      const setIndexes = (action, meta) => {
        meta.indexes = getIndexes(plural, action.id);
      };

      const unbinds = [
        client.type(changedType, setIndexes, { event: 'preadd', id }),
        client.type(changeType, setIndexes, { event: 'preadd', id }),
        client.type(deletedType, setIndexes, { event: 'preadd', id }),
        client.type(deleteType, setIndexes, { event: 'preadd', id }),
        client.type(createdType, reasonsForFields, { event: 'preadd', id }),
        client.type(changedType, reasonsForFields, { event: 'preadd', id }),
        client.type(changeType, reasonsForFields, { event: 'preadd', id }),
        client.type(deletedType, removeReasons, { id }),
        client.type(
          deleteType,
          async (action, meta) => {
            await task(async () => {
              try {
                await track(client, meta.id);
                removeReasons();
              } catch {
                await client.log.changeMeta(meta.id, { reasons: [] });
              }
            });
          },
          { id },
        ),
        client.type(createdType, setFields, { id }),
        client.type(changedType, setFields, { id }),
        client.type(
          changeType,
          async (action, meta) => {
            const endTask = startTask();
            // @ts-expect-error fix-types
            changeIfLast(store, action.fields, meta);
            try {
              await track(client, meta.id);
              // @ts-expect-error fix-types
              saveProcessAndClean(action.fields, meta);
              if (store.offline) {
                client.log.add(
                  { ...action, type: changedType },
                  { time: meta.time },
                );
              }
              endTask();
            } catch {
              client.log.changeMeta(meta.id, { reasons: [] });
              // @ts-expect-error fix-types
              const reverting = new Set(Object.keys(action.fields));
              client.log
                .each({ index: `${plural}/${id}` }, (a, m) => {
                  // @ts-expect-error fix-types
                  if (a.id === id && m.id !== meta.id) {
                    if (
                      (a.type === changeType ||
                        a.type === changedType ||
                        a.type === createType ||
                        a.type === createdType) &&
                      // @ts-expect-error fix-types
                      Object.keys(a.fields).some((i) => reverting.has(i))
                    ) {
                      const revertDiff = {};
                      // @ts-expect-error fix-types
                      for (const key in a.fields) {
                        if (reverting.has(key)) {
                          delete store.lastChanged[key];
                          reverting.delete(key);
                          // @ts-expect-error fix-types
                          revertDiff[key] = a.fields[key];
                        }
                      }
                      changeIfLast(store, revertDiff, m);
                      return reverting.size === 0 ? false : undefined;
                    } else if (
                      a.type === deleteType ||
                      a.type === deletedType
                    ) {
                      return false;
                    }
                  }
                  return undefined;
                })
                .then(() => {
                  for (const key of reverting) {
                    // @ts-expect-error fix-types
                    store.setKey(key, undefined);
                  }
                  endTask();
                });
            }
          },
          { id },
        ),
      ];

      if (store.remote) {
        unbinds.push(() => {
          if (!loadingError) {
            client.log.add(
              { type: 'logux/unsubscribe', channel: subscribe.channel },
              { sync: true },
            );
          }
        });
      }

      return () => {
        delete Template.cache[id];
        for (const i of unbinds) i();
        if (!store.offline) {
          // eslint-disable-next-line guard-for-in
          for (const key in store.lastChanged) {
            client.log.removeReason(`${plural}/${id}/${key}`);
          }
        }
      };
    });

    return store;
  };

  // @ts-expect-error fix-types
  Template.plural = plural;
  Template.offline = Boolean(opts.offline);
  Template.remote = opts.remote !== false;

  if (process.env.NODE_ENV !== 'production') {
    Template[clean] = () => {
      // eslint-disable-next-line guard-for-in
      for (const id in Template.cache) {
        Template.cache[id][clean]();
      }
      Template.cache = {};
      if (Template.filters) {
        // eslint-disable-next-line guard-for-in
        for (const id in Template.filters) {
          Template.filters[id][clean]();
        }
        delete Template.filters;
      }
    };
  }

  return Template;
}

function addSyncAction(client: Client, Template, action) {
  const meta = { indexes: getIndexes(Template.plural, action.id) };
  if (!Template.remote) {
    action.type += 'd';
  }
  if (Template.remote) {
    return task(() => client.sync(action, meta));
  } else {
    return task(() => client.log.add(action, meta));
  }
}

export function createSyncMap(client, Template, value) {
  const { id, ...fields } = value;
  return addSyncAction(client, Template, {
    type: `${Template.plural}/create`,
    id,
    fields,
  });
}

export async function buildNewSyncMap(client, Template, value) {
  const { id, ...fields } = value;
  const actionId = client.log.generateId();

  const verb = Template.remote ? 'create' : 'created';
  const type = `${Template.plural}/${verb}`;
  const action = { type, id, fields };
  const meta = {
    id: actionId,
    time: parseInt(actionId),
    indexes: getIndexes(Template.plural, id),
  };
  // @ts-expect-error fix-types
  if (Template.remote) meta.sync = true;
  await task(() => client.log.add(action, meta));

  const store = Template(id, client, action, meta);
  return store;
}

export function changeSyncMapById(
  client: Client,
  Template,
  id,
  fields,
  value: any = undefined,
) {
  if (value) fields = { [fields]: value };
  return addSyncAction(client, Template, {
    type: `${Template.plural}/change`,
    id,
    fields,
  });
}

export function changeSyncMap(store, fields, value) {
  if (value) fields = { [fields]: value };
  changeIfLast(store, fields);
  return changeSyncMapById(store.client, store, store.get().id, fields);
}

export function deleteSyncMapById(client, Template, id) {
  return addSyncAction(client, Template, {
    type: `${Template.plural}/delete`,
    id,
  });
}

export function deleteSyncMap(store) {
  return deleteSyncMapById(store.client, store, store.get().id);
}
