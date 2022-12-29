/**
 * Handle documents:
 * Serialization/deserialization, Copying
 * Querying, update
 * * Use sift, which implements mongodb query language, to scan documents instead of current code.
 */

import _ from 'lodash';

const modifierFunctions = {} as any;
const lastStepModifierFunctions = {} as any;
const comparisonFunctions = {} as any;
const logicalOperators = {} as any;
const arrayComparisonFunctions = {} as any;

/**
 * Check a key, throw an error if the key is non valid
 * - Non-treatable edge cases here: if part of the object if of the form { $$date: number } or { $$deleted: true }
 * - Its serialized-then-deserialized version it will transformed into a Date object
 * - But you really need to want it to trigger such behaviour, even when warned not to use '$' at the beginning of the field names...
 * @param {String} k key
 * @param {Model} v value, needed to treat the Date edge case
 */
function checkKey(k: string, v: any) {
  if (typeof k !== 'string') return; // JSON.stringify callback in some environments calls it on arrays

  if (
    k[0] === '$' &&
    !(k === '$$date' && typeof v === 'number') &&
    !(k === '$$regex' && typeof v === 'string') &&
    !(k === '$$deleted' && v === true) &&
    !(k === '$$indexCreated') &&
    !(k === '$$indexRemoved')
  ) {
    throw new Error('Field names cannot begin with the $ character');
  }

  if (k.indexOf('.') !== -1) {
    throw new Error('Field names cannot contain a .');
  }
}

/**
 * Check a DB object and throw an error if it's not valid
 * - Works by applying the above `checkKey` function to all fields recursively
 */
export function checkObject(obj) {
  if (Array.isArray(obj)) {
    obj.forEach((o) => checkObject(o));
  }

  if (typeof obj === 'object' && obj !== null) {
    Object.keys(obj).forEach((k) => {
      checkKey(k, obj[k]);
      checkObject(obj[k]);
    });
  }
}

/**
 * Serialize an object to be persisted to a one-line string
 * - For serialization/deserialization, we use the native JSON parser and not eval or Function
 * - That gives us less freedom but data entered in the database may come from users
 * so eval and the like are not safe
 * - Accepted primitive types: Number, String, Boolean, Date, null
 *    - `null` will be preserved
 * - Accepted secondary types: Objects, Arrays
 */
export function serialize(obj) {
  let res;

  res = JSON.stringify(obj, function (k, v) {
    checkKey(k, v);

    if (v === undefined || v === null) {
      return v;
    }

    // Hackish way of checking if object is Date (this way it works between execution contexts in node-webkit).
    // 👀 We can't use value directly because for dates it is already string in this function (date.toJSON was already called), so we use this
    if (typeof this[k].getTime === 'function') {
      return { $$date: this[k].getTime() };
    }

    // same shit for RegExp
    if (typeof this[k].test === 'function') {
      return { $$regex: this[k].toString() };
    }

    return v;
  });

  return res;
}

/**
 * From a one-line representation of an object generate by the serialize function
 * Return the object itself
 */
export function deserialize(rawData: string) {
  return JSON.parse(rawData, (k, v) => {
    if (k === '$$date') {
      return new Date(v);
    }
    if (
      typeof v === 'string' ||
      typeof v === 'number' ||
      typeof v === 'boolean' ||
      v === null
    ) {
      return v;
    }
    if (v && v.$$date) {
      return v.$$date;
    }
    if (v && v.$$regex) {
      return deserializeRegex(v.$$regex);
    }

    return v;
  });
}

function deserializeRegex(r) {
  const spl = r.split('/');
  const flags = spl.pop();
  const regex = spl.slice(1).join('/');
  return new RegExp(regex, flags);
}

/**
 * Deep copy a DB object
 * The optional strictKeys flag (defaulting to false) indicates whether to copy everything or only fields
 * where the keys are valid, i.e. don't begin with $ and don't contain a .
 */
export function deepCopy(obj, strictKeys = undefined) {
  let res;

  if (
    typeof obj === 'boolean' ||
    typeof obj === 'number' ||
    typeof obj === 'string' ||
    obj === null ||
    obj instanceof Date
  ) {
    return obj;
  }

  if (Array.isArray(obj)) {
    res = [];
    obj.forEach((o) => {
      res.push(deepCopy(o, strictKeys));
    });
    return res;
  }

  if (typeof obj === 'object') {
    res = {};
    Object.keys(obj).forEach((k) => {
      if (!strictKeys || (k[0] !== '$' && k.indexOf('.') === -1)) {
        res[k] = deepCopy(obj[k], strictKeys);
      }
    });

    return res;
  }

  return undefined; // For now everything else is undefined. We should probably throw an error instead
}

/**
 * Tells if an object is a primitive type or a "real" object
 * Arrays are considered primitive
 */
export function isPrimitiveType(obj) {
  return (
    typeof obj === 'boolean' ||
    typeof obj === 'number' ||
    typeof obj === 'string' ||
    obj === null ||
    obj instanceof Date ||
    Array.isArray(obj)
  );
}

/**
 * Utility functions for comparing things
 * Assumes type checking was already done (a and b already have the same type)
 * - `compareNSB` works for numbers, strings and booleans
 */
function compareNSB(a, b) {
  if (a < b) {
    return -1;
  }
  if (a > b) {
    return 1;
  }
  return 0;
}

function compareArrays(a, b) {
  let i;
  let comp;

  for (i = 0; i < Math.min(a.length, b.length); i += 1) {
    comp = compareThings(a[i], b[i]);

    if (comp !== 0) {
      return comp;
    }
  }

  // Common section was identical, longest one wins
  return compareNSB(a.length, b.length);
}

/**
 * Used primarily in compound indexes. Returns a comparison function usable as
 * an Index's compareKeys function.
 */
export function compoundCompareThings(fields) {
  return function (a, b) {
    let i;
    let len;
    let comparison;

    // undefined
    if (a === undefined) {
      return b === undefined ? 0 : -1;
    }
    if (b === undefined) {
      return a === undefined ? 0 : 1;
    }

    // null
    if (a === null) {
      return b === null ? 0 : -1;
    }
    if (b === null) {
      return a === null ? 0 : 1;
    }

    for (i = 0, len = fields.length; i < len; i++) {
      comparison = compareThings(a[fields[i]], b[fields[i]]);
      if (comparison !== 0) {
        return comparison;
      }
    }

    return 0;
  };
}

/**
 * Compare { things U undefined }
 * Things are defined as any native types (string, number, boolean, null, date) and objects
 * We need to compare with undefined as it will be used in indexes
 * In the case of objects and arrays, we deep-compare
 * If two objects dont have the same type, the (arbitrary) type hierarchy is: undefined, null, number, strings, boolean, dates, arrays, objects
 * Return -1 if a < b, 1 if a > b and 0 if a = b (note that equality here is NOT the same as defined in areThingsEqual!)
 */
export function compareThings(a, b) {
  let aKeys;
  let bKeys;
  let comp;
  let i;

  // undefined
  if (a === undefined) {
    return b === undefined ? 0 : -1;
  }
  if (b === undefined) {
    return a === undefined ? 0 : 1;
  }

  // null
  if (a === null) {
    return b === null ? 0 : -1;
  }
  if (b === null) {
    return a === null ? 0 : 1;
  }

  // Numbers
  if (typeof a === 'number') {
    return typeof b === 'number' ? compareNSB(a, b) : -1;
  }
  if (typeof b === 'number') {
    return typeof a === 'number' ? compareNSB(a, b) : 1;
  }

  // Strings
  if (typeof a === 'string') {
    return typeof b === 'string' ? compareNSB(a, b) : -1;
  }
  if (typeof b === 'string') {
    return typeof a === 'string' ? compareNSB(a, b) : 1;
  }

  // Booleans
  if (typeof a === 'boolean') {
    return typeof b === 'boolean' ? compareNSB(a, b) : -1;
  }
  if (typeof b === 'boolean') {
    return typeof a === 'boolean' ? compareNSB(a, b) : 1;
  }

  // Dates
  if (a instanceof Date) {
    return b instanceof Date ? compareNSB(a.getTime(), b.getTime()) : -1;
  }
  if (b instanceof Date) {
    return a instanceof Date ? compareNSB(a.getTime(), b.getTime()) : 1;
  }

  // Arrays (first element is most significant and so on)
  if (Array.isArray(a)) {
    return Array.isArray(b) ? compareArrays(a, b) : -1;
  }
  if (Array.isArray(b)) {
    return Array.isArray(a) ? compareArrays(a, b) : 1;
  }

  // Objects
  aKeys = Object.keys(a).sort();
  bKeys = Object.keys(b).sort();

  for (i = 0; i < Math.min(aKeys.length, bKeys.length); i += 1) {
    comp = compareThings(a[aKeys[i]], b[bKeys[i]]);

    if (comp !== 0) {
      return comp;
    }
  }

  return compareNSB(aKeys.length, bKeys.length);
}

// ==============================================================
// Updating documents
// ==============================================================

/**
 * The signature of modifier functions is as follows
 * Their structure is always the same: recursively follow the dot notation while creating
 * the nested documents if needed, then apply the "last step modifier"
 * @param {Object} obj The model to modify
 * @param {String} field Can contain dots, in that case that means we will set a subfield recursively
 * @param {Model} value
 */

/**
 * Set a field to a new value
 */
lastStepModifierFunctions.$set = (obj, field, value) => {
  obj[field] = value;
};

/**
 * Unset a field
 */
lastStepModifierFunctions.$unset = (obj, field, value) => {
  delete obj[field];
};

/**
 * Push an element to the end of an array field
 */
lastStepModifierFunctions.$push = (obj, field, value) => {
  // Create the array if it doesn't exist
  if (!obj.hasOwnProperty(field)) {
    obj[field] = [];
  }

  if (!Array.isArray(obj[field])) {
    throw new Error("Can't $push an element on non-array values");
  }

  if (value !== null && typeof value === 'object' && value.$each) {
    if (Object.keys(value).length > 1) {
      throw "Can't use another field in conjunction with $each";
    }
    if (!Array.isArray(value.$each)) {
      throw '$each requires an array value';
    }

    value.$each.forEach(function (v) {
      obj[field].push(v);
    });
  } else {
    obj[field].push(value);
  }
};

/**
 * Add an element to an array field only if it is not already in it
 * No modification if the element is already in the array
 * Note that it doesn't check whether the original array contains duplicates
 */
lastStepModifierFunctions.$addToSet = function (obj, field, value) {
  let addToSet = true;

  // Create the array if it doesn't exist
  if (!obj.hasOwnProperty(field)) {
    obj[field] = [];
  }

  if (!Array.isArray(obj[field])) {
    throw "Can't $addToSet an element on non-array values";
  }

  if (value !== null && typeof value === 'object' && value.$each) {
    if (Object.keys(value).length > 1) {
      throw "Can't use another field in conjunction with $each";
    }
    if (!Array.isArray(value.$each)) {
      throw '$each requires an array value';
    }

    value.$each.forEach(function (v) {
      lastStepModifierFunctions.$addToSet(obj, field, v);
    });
  } else {
    obj[field].forEach(function (v) {
      if (compareThings(v, value) === 0) {
        addToSet = false;
      }
    });
    if (addToSet) {
      obj[field].push(value);
    }
  }
};

/**
 * Remove the first or last element of an array
 */
lastStepModifierFunctions.$pop = function (obj, field, value) {
  if (!Array.isArray(obj[field])) {
    throw "Can't $pop an element from non-array values";
  }
  if (typeof value !== 'number') {
    throw value + " isn't an integer, can't use it with $pop";
  }
  if (value === 0) {
    return;
  }

  if (value > 0) {
    obj[field] = obj[field].slice(0, obj[field].length - 1);
  } else {
    obj[field] = obj[field].slice(1);
  }
};

/**
 * Removes all instances of a value from an existing array
 */
lastStepModifierFunctions.$pull = function (obj, field, value) {
  let arr;
  let i;

  if (!Array.isArray(obj[field])) {
    throw "Can't $pull an element from non-array values";
  }

  arr = obj[field];
  for (i = arr.length - 1; i >= 0; i -= 1) {
    if (match(arr[i], value)) {
      arr.splice(i, 1);
    }
  }
};

/**
 * Increment a numeric field's value
 */
lastStepModifierFunctions.$inc = function (obj, field, value) {
  if (typeof value !== 'number') {
    throw new Error(value + ' must be a number');
  }

  if (typeof obj[field] !== 'number') {
    if (!_.has(obj, field)) {
      obj[field] = value;
    } else {
      throw "Don't use the $inc modifier on non-number fields";
    }
  } else {
    obj[field] += value;
  }
};

/** Given its name, create the complete modifier function */
function createModifierFunction(modifier) {
  return (obj, field, value) => {
    const fieldParts = typeof field === 'string' ? field.split('.') : field;

    if (fieldParts.length === 1) {
      lastStepModifierFunctions[modifier](obj, field, value);
    } else {
      obj[fieldParts[0]] = obj[fieldParts[0]] || {};
      modifierFunctions[modifier](
        obj[fieldParts[0]],
        fieldParts.slice(1),
        value,
      );
    }
  };
}

// Actually create all modifier functions
Object.keys(lastStepModifierFunctions).forEach((modifier) => {
  modifierFunctions[modifier] = createModifierFunction(modifier);
});

/**
 * Modify a DB object according to an update query
 */
export function modify(obj, updateQuery) {
  const keys = Object.keys(updateQuery);
  const firstChars = keys.map(key => key[0]);
  const dollarFirstChars = firstChars.filter(c => c === '$')
  let newDoc;
  let modifiers;

  if (keys.indexOf('_id') !== -1 && updateQuery._id !== obj._id) {
    throw "You cannot change a document's _id";
  }

  if (
    dollarFirstChars.length !== 0 &&
    dollarFirstChars.length !== firstChars.length
  ) {
    throw 'You cannot mix modifiers and normal fields';
  }

  if (dollarFirstChars.length === 0) {
    // Simply replace the object with the update query contents
    newDoc = deepCopy(updateQuery);
    newDoc._id = obj._id;
  } else {
    // Apply modifiers
    modifiers = _.uniq(keys);
    newDoc = deepCopy(obj);
    modifiers.forEach((m) => {
      let keys;

      if (!modifierFunctions[m]) {
        throw 'Unknown modifier ' + m;
      }

      try {
        const queryModifier = updateQuery[m];
        if (queryModifier == null || ['string', 'number', 'boolean'].includes(typeof queryModifier)) {
          throw new Error('Modifier ' + m + "'s argument must be an object")
        }
        keys = Object.keys(queryModifier);
      } catch (e) {
        throw 'Modifier ' + m + "'s argument must be an object";
      }

      keys.forEach((k) => {
        modifierFunctions[m](newDoc, k, updateQuery[m][k]);
      });
    });
  }

  // Check result is valid and return it
  checkObject(newDoc);

  if (obj._id !== newDoc._id) {
    throw "You can't change a document's _id";
  }
  return newDoc;
}

// ==============================================================
// Finding documents
// ==============================================================

/**
 * Get a value from object with dot notation
 * @param {Object} obj
 * @param {String} field
 */
export function getDotValue(obj, field) {
  const fieldParts = typeof field === 'string' ? field.split('.') : field;
  let i;
  let objs;

  if (!obj) {
    return undefined;
  } // field cannot be empty so that means we should return undefined so that nothing can match

  if (fieldParts.length === 0) {
    return obj;
  }

  if (fieldParts.length === 1) {
    return obj[fieldParts[0]];
  }

  if (Array.isArray(obj[fieldParts[0]])) {
    // If the next field is an integer, return only this item of the array
    i = parseInt(fieldParts[1], 10);
    if (typeof i === 'number' && !isNaN(i)) {
      return getDotValue(obj[fieldParts[0]][i], fieldParts.slice(2));
    }

    // Return the array of values
    objs = [];
    for (i = 0; i < obj[fieldParts[0]].length; i += 1) {
      objs.push(getDotValue(obj[fieldParts[0]][i], fieldParts.slice(1)));
    }
    return objs;
  } else {
    return getDotValue(obj[fieldParts[0]], fieldParts.slice(1));
  }
}

/**
 * Check whether 'things' are equal
 * - Things are defined as any native types (string, number, boolean, null, date) and objects
 * - In the case of object, we check deep equality
 * - Returns true if they are, false otherwise
 */
export function areThingsEqual(a, b) {
  let aKeys;
  let bKeys;
  let i;

  // Strings, booleans, numbers, null
  if (
    a === null ||
    typeof a === 'string' ||
    typeof a === 'boolean' ||
    typeof a === 'number' ||
    b === null ||
    typeof b === 'string' ||
    typeof b === 'boolean' ||
    typeof b === 'number'
  ) {
    return a === b;
  }

  // Dates
  if (a instanceof Date || b instanceof Date) {
    return (
      a instanceof Date && b instanceof Date && a.getTime() === b.getTime()
    );
  }

  // Arrays (no match since arrays are used as a $in)
  // undefined (no match since they mean field doesn't exist and can't be serialized)
  if (
    Array.isArray(a) ||
    Array.isArray(b) ||
    a === undefined ||
    b === undefined
  ) {
    return false;
  }

  // General objects (check for deep equality)
  // a and b should be objects at this point
  try {
    aKeys = Object.keys(a);
    bKeys = Object.keys(b);
  } catch (e) {
    return false;
  }

  if (aKeys.length !== bKeys.length) {
    return false;
  }
  for (i = 0; i < aKeys.length; i += 1) {
    if (bKeys.indexOf(aKeys[i]) === -1) {
      return false;
    }
    if (!areThingsEqual(a[aKeys[i]], b[aKeys[i]])) {
      return false;
    }
  }
  return true;
}

/**
 * Check that two values are comparable
 */
function areComparable(a, b) {
  if (
    typeof a !== 'string' &&
    typeof a !== 'number' &&
    !(a instanceof Date) &&
    typeof b !== 'string' &&
    typeof b !== 'number' &&
    !(b instanceof Date)
  ) {
    return false;
  }

  if (typeof a !== typeof b) {
    return false;
  }

  return true;
}

/**
 * Arithmetic and comparison operators
 * @param {Native value} a Value in the object
 * @param {Native value} b Value in the query
 */
comparisonFunctions.$lt = function (a, b) {
  return areComparable(a, b) && a < b;
};

comparisonFunctions.$lte = function (a, b) {
  return areComparable(a, b) && a <= b;
};

comparisonFunctions.$gt = function (a, b) {
  return areComparable(a, b) && a > b;
};

comparisonFunctions.$gte = function (a, b) {
  return areComparable(a, b) && a >= b;
};

comparisonFunctions.$eq = function (a, b) {
  if (a === undefined) {
    return false;
  }
  return areThingsEqual(a, b);
};

comparisonFunctions.$ne = function (a, b) {
  return !comparisonFunctions.$eq(a, b);
};

comparisonFunctions.$in = function (a, b) {
  let i;

  if (!Array.isArray(b)) {
    throw '$in operator called with a non-array';
  }

  for (i = 0; i < b.length; i += 1) {
    if (areThingsEqual(a, b[i])) {
      return true;
    }
  }

  return false;
};

comparisonFunctions.$nin = function (a, b) {
  if (!Array.isArray(b)) {
    throw '$nin operator called with a non-array';
  }

  return !comparisonFunctions.$in(a, b);
};

comparisonFunctions.$regex = function (a, b) {
  if (!(b instanceof RegExp)) {
    throw '$regex operator called with non regular expression';
  }

  if (typeof a !== 'string') {
    return false;
  } else {
    return b.test(a);
  }
};

comparisonFunctions.$exists = function (value, exists) {
  if (exists || exists === '') {
    // This will be true for all values of exists except false, null, undefined and 0
    exists = true; // That's strange behaviour (we should only use true/false) but that's the way Mongo does it...
  } else {
    exists = false;
  }

  if (value === undefined) {
    return !exists;
  } else {
    return exists;
  }
};

comparisonFunctions.$elemMatch = function (obj, value) {
  if (!Array.isArray(obj)) {
    throw '$elemMatch operator used without an array';
  }
  for (let i = 0; i < obj.length; i += 1)
    if (match(obj[i], value)) {
      return true;
    }
  return false;
};

arrayComparisonFunctions.$elemMatch = true;
arrayComparisonFunctions.$not = true;

/**
 * Match any of the subqueries
 * @param {Model} obj
 * @param {Array of Queries} query
 */
logicalOperators.$or = function (obj, query) {
  let i;

  if (!Array.isArray(query)) {
    throw '$or operator used without an array';
  }

  for (i = 0; i < query.length; i += 1) {
    if (match(obj, query[i])) {
      return true;
    }
  }

  return false;
};

/**
 * Match all of the subqueries
 * @param {Model} obj
 * @param {Array of Queries} query
 */
logicalOperators.$and = function (obj, query) {
  let i;

  if (!Array.isArray(query)) {
    throw '$and operator used without an array';
  }

  for (i = 0; i < query.length; i += 1) {
    if (!match(obj, query[i])) {
      return false;
    }
  }

  return true;
};

/**
 * Inverted match of the query
 * @param {Model} obj
 * @param {Query} query
 */
logicalOperators.$not = function (obj, query) {
  return !match(obj, query);
};

// Required in the case of the query: { myProps: { $not: { $elemMatch: {} } }
comparisonFunctions.$not = logicalOperators.$not;

/**
 * Tell if a given document matches a query
 * @param {Object} obj Document to check
 * @param {Object} query
 */
export function match(obj, query) {
  let queryKeys;
  let queryKey;
  let queryValue;
  let i;

  // Primitive query against a primitive type
  // This is a bit of a hack since we construct an object with an arbitrary key only to dereference it later
  // But I don't have time for a cleaner implementation now
  if (isPrimitiveType(obj) || isPrimitiveType(query)) {
    return matchQueryPart({ needAKey: obj }, 'needAKey', query);
  }

  // Normal query
  queryKeys = Object.keys(query);
  for (i = 0; i < queryKeys.length; i += 1) {
    queryKey = queryKeys[i];
    queryValue = query[queryKey];

    if (queryKey[0] === '$') {
      if (!logicalOperators[queryKey]) {
        throw 'Unknown logical operator ' + queryKey;
      }
      if (!logicalOperators[queryKey](obj, queryValue)) {
        return false;
      }
    } else {
      if (!matchQueryPart(obj, queryKey, queryValue)) {
        return false;
      }
    }
  }

  return true;
}

/**
 * Match an object against a specific { key: value } part of a query
 * - if the `treatObjAsValue` flag is set, don't try to match every part separately, but the array as a whole
 */
function matchQueryPart(
  obj,
  queryKey,
  queryValue,
  treatObjAsValue = undefined,
) {
  const objValue = getDotValue(obj, queryKey);
  let i;
  let keys;
  let firstChars;
  let dollarFirstChars;

  // Check if the value is an array if we don't force a treatment as value
  if (Array.isArray(objValue) && !treatObjAsValue) {
    // Check if we are using an array-specific comparison function
    if (
      queryValue !== null &&
      typeof queryValue === 'object' &&
      !(queryValue instanceof RegExp)
    ) {
      keys = Object.keys(queryValue);
      for (i = 0; i < keys.length; i += 1) {
        if (arrayComparisonFunctions[keys[i]]) {
          return matchQueryPart(obj, queryKey, queryValue, true);
        }
      }
    }

    // If not, treat it as an array of { obj, query } where there needs to be at least one match
    for (i = 0; i < objValue.length; i += 1) {
      if (matchQueryPart({ k: objValue[i] }, 'k', queryValue)) {
        return true;
      } // k here could be any string
    }
    return false;
  }

  // queryValue is an actual object. Determine whether it contains comparison operators
  // or only normal fields. Mixed objects are not allowed
  if (
    queryValue !== null &&
    typeof queryValue === 'object' &&
    !(queryValue instanceof RegExp)
  ) {
    keys = Object.keys(queryValue);
    firstChars = keys.map(key => key[0]);
    dollarFirstChars = firstChars.filter(c => c === '$')

    if (
      dollarFirstChars.length !== 0 &&
      dollarFirstChars.length !== firstChars.length
    ) {
      throw new Error('You cannot mix operators and normal fields');
    }

    // queryValue is an object of this form: { $comparisonOperator1: value1, ... }
    if (dollarFirstChars.length > 0) {
      for (i = 0; i < keys.length; i += 1) {
        if (!comparisonFunctions[keys[i]]) {
          throw 'Unknown comparison function ' + keys[i];
        }

        if (!comparisonFunctions[keys[i]](objValue, queryValue[keys[i]])) {
          return false;
        }
      }
      return true;
    }
  }

  // Using regular expressions with basic querying
  if (queryValue instanceof RegExp) {
    return comparisonFunctions.$regex(objValue, queryValue);
  }

  // queryValue is either a native value or a normal object
  // Basic matching is possible
  if (!areThingsEqual(objValue, queryValue)) {
    return false;
  }

  return true;
}

export { comparisonFunctions as comparators };
