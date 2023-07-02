import bson from 'bson';
import _ from 'lodash';

import { type CreateIndexOptions } from './types/common';

const ObjectId = bson.ObjectID;

/** We can pass an object as a spec which really describes a single type, and not a sub-object
 * e.g. { type: "string", index: true }
 * */
const specAllowedKeys = [
  'type',
  'index',
  'unique',
  'sparse',
  'default',
  'get',
  'set',
  'enumerable',
];

/** is object and not array */
function isComplexSpec(spec) {
  return (
    typeof spec === 'object' &&
    !Array.isArray(spec) &&
    Object.keys(spec).every((x) => specAllowedKeys.includes(x))
  );
}

/** is simple with type/schema, not array/complex-obj */
function isNormalized(spec) {
  return (
    spec &&
    typeof spec === 'object' &&
    'schema' in spec &&
    'type' in spec &&
    !Array.isArray(spec) &&
    !isComplexSpec(spec)
  );
}

function mapSpec(spec) {
  if (spec === String) return 'string';
  if (spec === Number) return 'number';
  if (spec === Object) return 'object';
  if (spec === Array) return 'array';
  if (spec === Boolean) return 'boolean';
  if (spec === Date) return 'date';
  if (spec && spec.name === ObjectId.name) return 'ObjectId';
  return spec;
}

/** recursively normalize all of schema obj props
 * - add `{ type:'object', schema:{ nestedSchema} }` to nested def
 */
export function normalize(schema) {
  Object.keys(schema).forEach((key) => {
    const spec = schema[key];
    if (isNormalized(spec)) return;

    if (isComplexSpec(spec)) {
      if (Array.isArray(spec.type)) {
        schema[key] = {
          type: 'array',
          schema: mapSpec(spec.type[0]) || undefined,
          ..._.pickBy(spec, (specValue, specKey) => {
            return (
              specKey !== 'type' && specAllowedKeys.indexOf(specKey) !== -1
            );
          }),
        };
      } else {
        spec.type = mapSpec(spec.type);
      }
      return;
    } else if (Array.isArray(spec)) {
      schema[key] = { schema: mapSpec(spec[0]) || undefined, type: 'array' };
    } else if (typeof spec === 'object') {
      schema[key] = { schema: normalize(spec), type: 'object' };
    } else {
      schema[key] = { type: mapSpec(spec) };
    }
  });

  return schema;
}

// function normalize(schema) {
//   _.each(schema, function (spec, key) {
//     if (isComplexSpec(spec)) {
//       spec.type = mapSpec(spec.type);
//       return;
//     } else if (util.isArray(spec))
//       schema[key] = { schema: mapSpec(spec[0]) || undefined, type: 'array' };
//     else if (typeof spec == 'object')
//       schema[key] = { schema: normalize(spec), type: 'object' };
//     else schema[key] = { type: mapSpec(spec) };
//   });

//   return schema;
// }

/** enhance self by schema info, by `Object.defineProperty` */
export function construct(self, schema) {
  // TODO: incorporate _ctime and _mtime here, making them default non-enumerable date props
  // Has some minor increase on time it takes to do DB operations - but we want schema support

  // Special case for arrays
  if (Array.isArray(self)) {
    const type = schema;
    if (!type) return self;

    let len = self.length;
    while (len--) {
      if (typeof self[len] === type) continue;

      if (canCast(self[len], type)) {
        self[len] = castToType(self[len], type);
      } else {
        self.splice(len, 1);
      }
    }
    return self;
  }

  // Dynamic getter/setter for objects
  Object.keys(schema).forEach((key) => {
    const spec = schema[key];
    if (spec.get || spec.set) {
      const val1 = self[key];
      const hasVal = self.hasOwnProperty(key);
      Object.defineProperty(self, key, {
        get: spec.get,
        set: spec.set,
        enumerable: true,
      });
      if (hasVal) self[key] = val1; // call the setter the first time if we already had a set value
      return;
    }

    if (!spec.type) return;

    let val;
    if (self.hasOwnProperty(key) && canCast(self[key], spec.type)) {
      val = castToType(self[key], spec.type);
    } else if (
      spec.hasOwnProperty('default') &&
      canCast(spec.default, spec.type)
    ) {
      val = castToType(spec.default, spec.type);
    } else {
      val = defaultValue(spec.type);
    }

    if (spec.schema) {
      construct(val, spec.schema);
    }

    Object.defineProperty(self, key, {
      enumerable: true,
      get:
        spec.type === 'array'
          ? () => {
              construct(val, spec.schema);
              return val;
            }
          : () => val,
      set: (v) => {
        if (canCast(v, spec.type)) {
          const oldVal = val;
          val = castToType(v, spec.type);
          if (spec.schema && val != oldVal) construct(val, spec.schema);
        }
      },
    });
  });

  return self;
}

function canCast(val, spec) {
  if (spec === true || spec === 'mixed') return true;
  if (spec === 'array' && Array.isArray(val)) return true;
  if (typeof val === spec) return true;
  if (typeof val === typeof spec) return true;
  if (spec === 'string' && val && val.toString) return true;
  if (spec === 'ObjectId' && val && val.toString) return true;
  //if (spec == "regexp" && typeof(val))
  if (spec === 'number' && !isNaN(val)) return true;
  if (spec === 'date' && !isNaN(new Date(val).getTime())) return true;
  if (spec === 'boolean' && !isNaN(val)) return true;
  if (spec instanceof RegExp && val.toString && spec.test(val)) return true;
  return false;
}

function castToType(val, spec) {
  if (spec === true || spec === 'mixed') return val;
  if (spec === 'array' && Array.isArray(val)) return val;
  if (typeof val === spec) return val;
  if (typeof val === typeof spec) return val;
  if (spec === 'string') return val.toString();
  if (spec === 'ObjectId') return val.toString();
  if (spec === 'number') return parseFloat(val);
  if (spec === 'boolean') return Boolean(val);
  if (spec === 'date') return new Date(val);
  if (spec instanceof RegExp) return val.toString();
}

// TODO: copy from validate.js
function defaultValue(spec) {
  if (spec instanceof RegExp) return '';
  return {
    string: '',
    id: null,
    number: 0,
    boolean: false,
    date: new Date(),
    // @ts-expect-error fix-types
    regexp: new RegExp(),
    function: () => {},
    array: [],
    object: {},
    ObjectId: null,
  }[spec];
}

/** recursively build index-options for all schemaObj keys, nested prop is `p1.p11` */
export function getIndexes(schemaObj, prefix = '') {
  let indexes: CreateIndexOptions[] = [];
  Object.keys(schemaObj).forEach((key) => {
    const spec = schemaObj[key];
    if (spec.schema && typeof spec.schema === 'object') {
      return (indexes = indexes.concat(
        getIndexes(spec.schema, prefix + key + '.'),
      ));
    }
    if (spec.index) {
      // now we know spec is a special object: add the index
      indexes.push({
        fieldName: prefix + key,
        sparse: spec.sparse,
        unique: spec.unique,
      });
    }
  });
  return indexes;
}
