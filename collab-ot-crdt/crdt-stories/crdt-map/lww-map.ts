let counter = 1;
// const randomId = () => crypto.randomUUID().replace(/-/g, '');
const randomId = () => counter++;

type CrdtMapOptions = {
  clientId?: number;
};

/**
 * Similar to a LWW-Element-Set but being a key-value store instead of just unique keys.
 * - Latest key update is always used, with some conflict resolution when timestamp is equal
 * - forked from https://github.com/hesselbom/crdtmap
 */
export function CrdtMap(options: CrdtMapOptions = {}) {
  /** crdt data store */
  const map = new Map<string, any>();
  /**  */
  const subMaps = new Map<string, any>();
  /**  */
  const stateVectors = new Map<number, any>();
  /** event emitter registry */
  const observers = new Map<string, Set<(...args: any[]) => any>>();
  const localClientId = (options && options.clientId) || randomId();

  /** gc old data and vectors */
  const clearToTimestamp = (timestamp) => {
    // Clear old removed/tombstoned data
    for (const [key, value] of map.entries()) {
      if (value.data === null && value.timestamp < timestamp) {
        map.delete(key);
      }
    }

    // Clear old state vectors
    for (const [key, vector] of stateVectors.entries()) {
      if (vector < timestamp) {
        stateVectors.delete(key);
      }
    }
  };

  return {
    clientId: localClientId,
    on: (name, callback) => {
      let value = observers.get(name);
      // if (name === 'update') {
      //   console.log(';; doc-on ', value)
      // }
      if (value === undefined) {
        observers.set(name, (value = new Set()));
      }
      value.add(callback);
    },
    off: (name, callback) => {
      const nameObservers = observers.get(name);
      if (nameObservers != null) {
        nameObservers.delete(callback);
        if (nameObservers.size === 0) {
          observers.delete(name);
        }
      }
    },
    once: function (name, callback) {
      const _f = (...args) => {
        this.off(name, _f);
        callback(...args);
      };
      this.on(name, _f);
    },
    emit: (name, args) => {
      if (name === 'key11') {
        console.log(';; key11-e ', observers.get(name));
      }
      // copy all listeners to an array first to make sure that no event is emitted to listeners that are subscribed while the event handler is called.
      return Array.from((observers.get(name) || new Map()).values()).forEach(
        (f) => f(...args),
      );
    },
    get: (key) => {
      const data = map.get(key);
      return (data && data.data) || undefined;
    },
    /** Returns true if update is applied (i.e. latest data) */
    set: function (
      key,
      data,
      timestamp?: number,
      clientId?: number,
      emitEvents = true,
    ) {
      clientId = clientId == null ? localClientId : clientId;
      timestamp = timestamp == null ? Date.now() : timestamp;

      // Update client state vector
      stateVectors.set(
        clientId,
        Math.max(stateVectors.get(clientId) || 0, timestamp),
      );

      const existing = map.get(key);
      if (!existing) {
        map.set(key, { timestamp, data, clientId });
        if (emitEvents) {
          // if (key === 'key11') {
          //   console.log(';; key11-set ', observers.get(key));
          // }
          this.emit('update', [{ [key]: { data, timestamp, clientId } }]);
        }
        return true;
      }

      // Conflict resolution when removing with same timestamp
      if (data === null && timestamp === existing.timestamp) {
        return false;
      }

      // Conflict resolution when adding with same timestamp but different clients
      if (timestamp === existing.timestamp && clientId !== existing.clientId) {
        if (clientId > existing.clientId) {
          map.set(key, { timestamp, data, clientId });
          if (emitEvents)
            this.emit('update', [{ [key]: { data, timestamp, clientId } }]);
          return true;
        }
        return false;
      }

      if (timestamp >= existing.timestamp) {
        // / lww update
        map.set(key, { timestamp, data, clientId });
        if (emitEvents)
          this.emit('update', [{ [key]: { data, timestamp, clientId } }]);
        return true;
      }

      return false;
    },
    remove: function (key, timestamp, clientId?: number) {
      this.set(key, null, timestamp, clientId);
    },
    delete: function (key, timestamp, clientId) {
      this.remove(key, timestamp, clientId);
    },
    has: function (key) {
      return !!this.get(key);
    },
    toJSON: () => {
      const obj = {};
      map.forEach((value, key) => {
        if (value.data !== null) {
          obj[key] = value.data;
        }
      });
      return obj;
    },
    /** Clear old tombstoned data up to timestamp
     * - Will also clear old clientId vectors to make up space
     * - Warning! This is potentially dangerous, make sure all data has been synced up to this timestamp
     */
    clearToTimestamp,
    /** update crdt-map with snapshot-data */
    applySnapshot: function (snapshot) {
      const appliedSnapshot = {};
      for (const [key, value] of Object.entries(snapshot)) {
        // @ts-expect-error fix-types
        if (this.set(key, value.data, value.timestamp, value.clientId, false)) {
          appliedSnapshot[key] = value;
        }
      }
      this.emit('snapshot', [snapshot, appliedSnapshot]);
    },
    getSnapshotFromTimestamp: (timestamp) => {
      const obj = {};
      map.forEach((value, key) => {
        if (value.timestamp >= timestamp) {
          obj[key] = value;
        }
      });
      return obj;
    },
    getSnapshotFromStateVectors: (stateVectors) => {
      const obj = {};
      map.forEach((value, key) => {
        const vector = stateVectors[value.clientId];
        if (!vector || value.timestamp > vector) {
          obj[key] = value;
        }
      });
      return obj;
    },
    getStateVectors: () => {
      return Object.fromEntries(stateVectors);
    },
    destroy: function () {
      this.emit('destroy', []);
    },
    /**
     * always return subMap
     */
    getMap: function (name) {
      let subMap = subMaps.get(name);
      if (subMap) return subMap;

      const prefix = name + ':';

      subMap = {
        set: (key, data, timestamp, clientId) =>
          this.set(prefix + key, data, timestamp, clientId),
        remove: (key, timestamp, clientId) =>
          this.remove(prefix + key, timestamp, clientId),
        delete: (key, timestamp, clientId) =>
          this.remove(prefix + key, timestamp, clientId),
        has: (key) => this.has(prefix + key),
        get: (key) => this.get(prefix + key),
        forEach: (cb) =>
          map.forEach((data, key) => {
            if (data.data && String(key).startsWith(prefix)) {
              cb(data.data, String(key).substr(prefix.length));
            }
          }),
        entries: () => {
          const results: any[] = [];

          map.forEach((data, key) => {
            if (data.data && String(key).startsWith(prefix)) {
              results.push([String(key).substr(prefix.length), data.data]);
            }
          });

          return results;
        },
        toJSON: function () {
          const obj = {};

          map.forEach((value, key) => {
            if (value.data !== null && String(key).startsWith(prefix)) {
              obj[String(key).substr(prefix.length)] = value.data;
            }
          });

          return obj;
        },
      };
      subMaps.set(name, subMap);

      return subMap;
    },
    /** test-only */
    // observers,
  };
}

// CrdtMap.encodeSnapshot = function encodeSnapshot(snapshot) {
//   const encoder = encoding.createEncoder();

//   for (const [key, value] of Object.entries(snapshot)) {
//     if (value.data === null) {
//       encoding.writeUint8(encoder, 0);
//       encoding.writeVarString(encoder, key);
//       encoding.writeFloat64(encoder, value.timestamp);
//       encoding.writeUint32(encoder, value.clientId);
//     } else {
//       encoding.writeUint8(encoder, 1);
//       encoding.writeVarString(encoder, key);
//       encoding.writeFloat64(encoder, value.timestamp);
//       encoding.writeUint32(encoder, value.clientId);
//       encoding.writeAny(encoder, value.data);
//     }
//   }

//   return encoding.toUint8Array(encoder);
// };

// CrdtMap.decodeSnapshot = function decodeSnapshot(byteArray) {
//   const decoder = decoding.createDecoder(byteArray);
//   const snapshot = {};

//   while (decoder.pos < decoder.arr.length) {
//     const hasData = decoding.readUint8(decoder) === 1;
//     const key = decoding.readVarString(decoder);

//     const object = {
//       timestamp: decoding.readFloat64(decoder),
//       clientId: decoding.readUint32(decoder),
//     };

//     if (hasData) {
//       object.data = decoding.readAny(decoder);
//     } else {
//       object.data = null;
//     }

//     snapshot[key] = object;
//   }

//   return snapshot;
// };

// CrdtMap.encodeStateVectors = function encodeStateVectors(stateVectors) {
//   const encoder = encoding.createEncoder();

//   for (const [key, vector] of Object.entries(stateVectors)) {
//     encoding.writeVarString(encoder, key);
//     encoding.writeFloat64(encoder, vector);
//   }

//   return encoding.toUint8Array(encoder);
// };

// CrdtMap.decodeStateVectors = function decodeStateVectors(byteArray) {
//   const decoder = decoding.createDecoder(byteArray);
//   const stateVectors = {};

//   while (decoder.pos < decoder.arr.length) {
//     const key = decoding.readVarString(decoder);
//     const vector = decoding.readFloat64(decoder);

//     stateVectors[key] = vector;
//   }

//   return stateVectors;
// };
