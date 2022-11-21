import { OPLOG_STORE, init, onupgradeneeded, proxyStore } from '../idbsidesync';
import { uuid } from '../idbsidesync/utils';

// /存放在前端的业务表
const SHARED_SETTINGS = 'shared_settings';
const PROFILE_SETTINGS = 'profile_settings';
const PROFILES = 'profiles';
const TODO_TYPE_SYMLINKS = 'todo_type_symlinks';
const TODO_TYPES = 'todo_types';
const TODO_TYPES_BY_DELETED_INDEX = 'todo_types-index_by_deleted';
const TODO_ITEMS = 'todo_items';
const TODO_ITEMS_BY_DELETED_INDEX = 'todo_items-index_by_deleted';
const DELETED_PROP = 'deleted';
const DB_NAME = 'IDBSyncApp';

/** 全局单例的indexeddb实例 */
let db: Promise<IDBDatabase>;

if (!indexedDB) {
  alert(
    `💔 Your browser doesn't seem to support IndexedDB! This app can't work without it.`,
  );
}

/** Get a (cached/singleton) reference to an IndexedDB database via Promise.
 * - Mostly copied from https://github.com/jakearchibald/svgomg/blob/main/src/js/utils/storage.js).
 *
 * @returns a Promise that eventually resolves to the database.
 */
export function getDB() {
  if (!db) {
    db = new Promise((resolve, reject) => {
      const openreq = window.indexedDB.open(DB_NAME, 1);

      openreq.onsuccess = () => {
        (async () => {
          await init(openreq.result); // 👉🏻 初始化全局设置和hlc逻辑时钟
          resolve(openreq.result);
        })();
      };

      openreq.onerror = () => {
        let errorMsg = `🦖 Whoopsie, the app can't run if it can't open an IndexedDB database!`;
        if (
          navigator.userAgent.includes('Firefox') &&
          openreq!.error!.name === 'InvalidStateError'
        ) {
          errorMsg += `\n\nFirefox disables IndexedDB in private browsing mode to help prevent user tracking `;
          errorMsg += `(see https://bugzilla.mozilla.org/show_bug.cgi?id=781982 for more info).`;
        } else {
          errorMsg += `\n\n${openreq.error}\n\n`;
          errorMsg += `You might want to verify that IndexedDB is enabled in your browser.`;
        }
        alert(errorMsg);
        reject(openreq.error);
      };

      /** 👇🏻 trigger when you create a new database or increase the version number of an existing database */
      // 在客户端定义了整个数据库的结构，类似所有表的定义
      openreq.onupgradeneeded = (event) => {
        // @ts-expect-error ❓ result属性为何不在类型上，陈年bug
        const db = event.target!.result as IDBDatabase;
        onupgradeneeded(event);

        const todoTypeStore = db.createObjectStore(TODO_TYPES, {
          keyPath: 'id',
        });
        // Create an index so we can quickly query for non-deleted types using an IDBKeyRange. Note that we'll need to
        // A) ensure that non-deleted objects have a value for this prop, and B) we use something other than booleans
        // for the values, since you can't use boolean as keys / index them (we'll use 0/1 to indicate deleted).
        todoTypeStore.createIndex(TODO_TYPES_BY_DELETED_INDEX, DELETED_PROP, {
          unique: false,
        });

        const todoItemsStore = db.createObjectStore(TODO_ITEMS, {
          keyPath: 'id',
        });
        todoItemsStore.createIndex(TODO_ITEMS_BY_DELETED_INDEX, DELETED_PROP, {
          unique: false,
        });

        // The todo type "mappings" store maps the IDs of todo types to "current" type IDs. You can think of it as a
        // symbolic link or shortcut... The todo items each have a "type" field set to the key of a record in this
        // store. This store, in turn, has that key pointing to the ID of the actual todo type. So you might have
        // a todo like `{ id: 'buy milk', type: 'symlinkKey1' }` and then have todo type symlink store that looks like
        // `{ symlinkKey1: 'todoTypeAAA', symlinkKey2: 'todoTypeBBB' }`.
        //
        // This extra degree of separation between the todos and the actual types is done so that when a todo type is
        // deleted and all of its todos are "migrated" to another type, we only need to update that mapping in a single
        // place instead of needing to update _all_ the todos that "belong" to the deleted type.
        //
        // Also, this is good excuse to test/demo an object store that does NOT have a keyPath. 😉
        db.createObjectStore(TODO_TYPE_SYMLINKS);

        // Create an object store used for "global" app settings that will be shared across devices if syncing is
        // enabled. This is an excuse to test/demo a store that doesn't have a keyPath. We'll stuff primitive values in
        // here (e.g., `put(123, 'someSetting')`).
        db.createObjectStore(SHARED_SETTINGS);

        // Create an object store used for the names of app profiles. This is an excuse to test/demo a store where the
        // key is a value specified by the user (vs. something like a uuid generated by the app). The interesting
        // scenario here is creating a profile with name "Foo" on one device, creating a profile with the same name on
        // another device, and then setting up syncing across devices.
        db.createObjectStore(PROFILES, { keyPath: 'name' });

        // Create an object store used for "per profile" settings that will be shared across devices if syncing is
        // enabled (e.g., a profile with a larger font size). This is an excuse to test/demo a store that has a
        // compound/composite keyPath (i.e., each object in the store is uniquely identified by a combination of values
        // for specific props).
        db.createObjectStore(PROFILE_SETTINGS, {
          keyPath: ['profileName', 'settingName'],
        });
      };
    });
  }

  return db;
}

export function deleteDB() {
  return new Promise((resolve, reject) => {
    getDB().then((db) => {
      console.log('db:', db);
      console.log('Attempting to close database...');
      db.close();
      console.log('Attempting to delete database...');
      const deleteReq = indexedDB.deleteDatabase(DB_NAME);
      deleteReq.onblocked = () => {
        console.log('deleting idb gets blocked');
      };
      deleteReq.onerror = (event) => {
        console.error('Failed to delete database');
        reject(event);
      };
      deleteReq.onsuccess = () => {
        console.log('onsuccess deleted database');
        resolve(undefined);
      };
      // @ts-ignore Property 'oncomplete' does not exist on type 'IDBOpenDBRequest'.
      // deleteReq.oncomplete = () => {
      //   console.log('oncomplete deleted database');
      //   resolve(undefined);
      // };
    });
  });
}

/** 先拿到storeName在idb对应的对象，然后传给callback执行
 * - Convenience function for initiating an IndexedDB transaction and getting a reference to an object store.
 * - Makes it possible to use promise/async/await to "wait" for a transaction to complete. Example:
 *
 * @example
 * ```
 * let result;
 *
 * // "Waits" until the entire transaction completes
 * await txWithStore('myStore', 'readwrite', (store) => {
 *   const getOrUpdateReq = store.add(myThing);
 *   getOrUpdateReq.onsuccess = (event) => {
 *     result = event.target.result;
 *   }
 * });
 *
 * // Now do something else that may depend on the transaction having completed and 'myThing' having been added...
 * console.log('Your thing was added:', result);
 * ```
 *
 * @param {string} storeName - name of object store to retrieve
 * @param {string} mode - "readonly" | "readwrite"
 * @param {function} callback - will be called, with the object store as the first parameter.
 *
 * @returns a Promise that will resolve once the transaction completes successfully.
 */
async function txWithStore(
  storeName: string,
  mode: 'readonly' | 'readwrite',
  callback: (args: IDBObjectStore) => void,
) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const trRequest = db.transaction([storeName, OPLOG_STORE], mode);
    trRequest.oncomplete = () => resolve(undefined);
    trRequest.onerror = () => reject(trRequest.error);

    // 👇🏻 object store is immediately available (i.e., this is synchronous).
    const store = trRequest.objectStore(storeName);
    const proxiedStore = proxyStore(store);
    callback(proxiedStore);
  });
}

async function txWithStores(
  storeNames: string[],
  mode: 'readonly' | 'readwrite',
  callback: (...args: any[]) => void,
) {
  const db = await getDB();
  return new Promise((resolve, reject) => {
    const trRequest = db.transaction([...storeNames, OPLOG_STORE], mode);
    trRequest.oncomplete = () => resolve(undefined);
    trRequest.onerror = () => reject(trRequest.error);

    // Note that the object stores are immediately available (i.e., this is synchronous).
    const stores = storeNames.map((name) => trRequest.objectStore(name));
    const proxiedStores = stores.map((store) => proxyStore(store));
    callback(...proxiedStores);
  });
}

export async function addTodo(todo) {
  let req;
  await txWithStore(TODO_ITEMS, 'readwrite', (store) => {
    req = store.add({
      id: uuid(),
      ...todo,
      [DELETED_PROP]: 0,
    });
  });

  return req.result;
}

export async function updateTodo(updates, id) {
  let req;
  await txWithStore(TODO_ITEMS, 'readwrite', (store) => {
    req = store.put(updates, id);
  });

  return req.result;
}

export function deleteTodo(id) {
  return updateTodo({ [DELETED_PROP]: 1 }, id);
}

export function undeleteTodo(id) {
  return updateTodo({ [DELETED_PROP]: 0 }, id);
}

export async function getAllTodos(deleted = false) {
  let req;
  await txWithStore(TODO_ITEMS, 'readonly', (store) => {
    const index = store.index(TODO_ITEMS_BY_DELETED_INDEX);
    req = index.getAll(IDBKeyRange.only(deleted ? 1 : 0));
  });

  return Array.isArray(req.result)
    ? await resolveTodos(req.result)
    : req.result;
}

/** 遍历参数todos，先添加type属性，再排序 */
async function resolveTodos(todos: any[]) {
  const resolvedTodos = [] as any[];
  for (const todo of todos) {
    const type = todo.type ? await getTodoType(todo.type) : null;
    resolvedTodos.push({ ...todo, type });
  }

  resolvedTodos.sort((t1: any, t2: any) => {
    if (t1.order < t2.order) {
      return 1;
    } else if (t1.order > t2.order) {
      return -1;
    }
    return 0;
  });

  return resolvedTodos;
}

export async function getTodoType(id) {
  let typeMappingReq;
  await txWithStore(TODO_TYPE_SYMLINKS, 'readonly', (store) => {
    typeMappingReq = store.get(id);
  });

  let typeReq;
  await txWithStore(TODO_TYPES, 'readonly', (store) => {
    typeReq = store.get(typeMappingReq.result);
  });

  return typeReq.result;
}

export async function getTodo(id) {
  let req;
  await txWithStore(TODO_ITEMS, 'readonly', (store) => {
    req = store.get(id);
  });
  return req.result;
}

export async function getNumTodos(includeDeleted = false) {
  let req;
  await txWithStore(TODO_ITEMS, 'readonly', (store) => {
    const index = store.index(TODO_ITEMS_BY_DELETED_INDEX);
    req = includeDeleted ? index.count() : index.count(IDBKeyRange.only(0));
  });
  return req.result;
}

export async function getTodoTypes(includeDeleted = false) {
  let req;
  await txWithStore(TODO_TYPES, 'readonly', (store) => {
    const index = store.index(TODO_TYPES_BY_DELETED_INDEX);
    req = includeDeleted ? index.getAll() : index.getAll(IDBKeyRange.only(0));
  });
  return req.result;
}

export async function addTodoType({ name, color }) {
  const typeId = uuid();
  await txWithStores(
    [TODO_TYPES, TODO_TYPE_SYMLINKS],
    'readwrite',
    (typeStore, typeSymlinkStore) => {
      // Ensure that non-deleted objects have a "false" value for the "deleted" prop, and use numeric value instead of a
      // boolean (since you can't use boolean as keys / index them).
      typeStore.add({ id: typeId, name, color, [DELETED_PROP]: 0 });
      typeSymlinkStore.add(typeId, typeId); // symlink ID -> target ID. We can re-use the target ID at first.
    },
  );
  return typeId;
}

export async function deleteTodoType(typeId, newTypeId) {
  await txWithStores(
    [TODO_TYPES, TODO_TYPE_SYMLINKS],
    'readwrite',
    (typeStore, typeSymlinkStore) => {
      // Update the type symlink to point to the new type
      if (newTypeId) {
        typeSymlinkStore.put(newTypeId, typeId);
      }

      // Now "delete" the todo type.
      typeStore.put({ id: typeId, [DELETED_PROP]: 1 });
    },
  );
}

export async function addProfileName(name) {
  let req;
  await txWithStore(PROFILES, 'readwrite', (store) => {
    req = store.add({ name });
  });
  return req.result;
}

export async function getAllProfileNames() {
  let req;
  await txWithStore(PROFILES, 'readonly', (store) => {
    req = store.getAll();
  });
  return req.result;
}

/** 从db中读取设置项 */
export async function getActiveProfileName() {
  let activeProfileName;
  await txWithStore(SHARED_SETTINGS, 'readonly', (store) => {
    const req = store.get('activeProfileName');
    req.onsuccess = (event) => {
      activeProfileName = req.result;
    };
  });
  return activeProfileName;
}

export async function updateActiveProfileName(newValue) {
  await txWithStore(SHARED_SETTINGS, 'readwrite', (store) => {
    const req = store.put(newValue, 'activeProfileName');
  });
}

export async function getBgColorSetting(profileName) {
  let bgColor;
  await txWithStore(PROFILE_SETTINGS, 'readonly', (store) => {
    const req = store.get([profileName, 'bgColor']);
    req.onsuccess = (event) => {
      // @ts-ignore
      bgColor = event!.target!.result ? event.target.result.value : null;
    };
  });
  return bgColor;
}

export async function updateBgColorSetting(profileName, newValue) {
  const existing = await getBgColorSetting(profileName);
  await txWithStore(PROFILE_SETTINGS, 'readwrite', (store) => {
    if (existing) {
      const req = store.put({ value: newValue }, [profileName, 'bgColor']);
    } else {
      const req = store.put({
        profileName,
        settingName: 'bgColor',
        value: newValue,
      });
    }
  });
  // printOpLog();
}

export async function getFontSizeSetting(profileName) {
  let fontSize;
  await txWithStore(PROFILE_SETTINGS, 'readonly', (store) => {
    const req = store.get([profileName, 'fontSize']);
    req.onsuccess = (event) => {
      // @ts-ignore
      fontSize = event.target.result ? event.target.result.value : 16;
    };
  });
  return fontSize;
}

export async function updateFontSizeSetting(profileName, newValue) {
  await txWithStore(PROFILE_SETTINGS, 'readwrite', (store) => {
    const req = store.put({
      profileName,
      settingName: 'fontSize',
      value: newValue,
    });
  });
  // printOpLog();
}

export async function printOpLog() {
  txWithStore(OPLOG_STORE, 'readonly', (store) => {
    const req = store.getAll();
    req.onsuccess = (event) => {
      // @ts-ignore
      console.log('All oplog entries:', event.target.result);
    };
  });
}
