/** Callback with no parameter */
export type NoParamCallback = (err?: Error) => any;

/**
 * Callback with generic parameters.
 */
export type GenericCallback = (err?: Error, ...args: any[]) => any;

/**
 * Generic document in NeDB.
 * It consists of an Object with anything you want inside.
 * @typedef document
 * @property {?string} [_id] Internal `_id` of the document, which can be `null` or undefined at some points (when not
 * inserted yet for example).
 * @type {object}
 */
export type GenericDocument = {
  /** Internal `_id` of the document, which can be `null` or undefined at some points (when not
   * inserted yet for example). */
  _id?: string;
};

/**
 * Callback that returns an Array of documents.
 */
export type MultipleDocumentsCallback = (
  err?: Error,
  docs?: GenericDocument[],
) => any;

/**
 * Callback that returns a single document.
 */
export type SingleDocumentCallback = (
  err?: Error,
  doc?: GenericDocument,
) => any;

/**
 * Generic async function.
 */
export type AsyncFunction = (...args: any[]) => Promise<any>;

/**
 * Nedb query.
 *
 * Each key of a query references a field name, which can use the dot-notation to reference subfields inside nested
 * documents, arrays, arrays of subdocuments and to match a specific element of an array.
 *
 * Each value of a query can be one of the following:
 * - `string`: matches all documents which have this string as value for the referenced field name
 * - `number`: matches all documents which have this number as value for the referenced field name
 * - `Regexp`: matches all documents which have a value that matches the given `Regexp` for the referenced field name
 * - `object`: matches all documents which have this object as deep-value for the referenced field name
 * - Comparison operators: the syntax is `{ field: { $op: value } }` where `$op` is any comparison operator:
 *   - `$lt`, `$lte`: less than, less than or equal
 *   - `$gt`, `$gte`: greater than, greater than or equal
 *   - `$in`: member of. `value` must be an array of values
 *   - `$ne`, `$nin`: not equal, not a member of
 *   - `$stat`: checks whether the document posses the property `field`. `value` should be true or false
 *   - `$regex`: checks whether a string is matched by the regular expression. Contrary to MongoDB, the use of
 *   `$options` with `$regex` is not supported, because it doesn't give you more power than regex flags. Basic
 *   queries are more readable so only use the `$regex` operator when you need to use another operator with it
 *   - `$size`: if the referenced filed is an Array, matches on the size of the array
 *   - `$elemMatch`: matches if at least one array element matches the sub-query entirely
 * - Logical operators: You can combine queries using logical operators:
 *   - For `$or` and `$and`, the syntax is `{ $op: [query1, query2, ...] }`.
 *   - For `$not`, the syntax is `{ $not: query }`
 *   - For `$where`, the syntax is:
 *   ```
 *   { $where: function () {
 *     // object is 'this'
 *     // return a boolean
 *   } }
 *   ```
 */
export type QueryType = Record<string, any>;

/**
 * Nedb projection.
 *
 * You can give `find` and `findOne` an optional second argument, `projections`.
 * The syntax is the same as MongoDB: `{ a: 1, b: 1 }` to return only the `a`
 * and `b` fields, `{ a: 0, b: 0 }` to omit these two fields. You cannot use both
 * modes at the time, except for `_id` which is by default always returned and
 * which you can choose to omit. You can project on nested documents.
 *
 * To reference subfields, you can use the dot-notation.
 *
 * @type {Object.<string, 0|1>}
 */
export type ProjectionType = Record<string, 0 | 1>;

/**
 * The `beforeDeserialization` and `afterDeserialization` callbacks are hooks which are executed respectively before
 * parsing each document and after stringify them. They can be used for example to encrypt the Datastore.
 * The `beforeDeserialization` should revert what `afterDeserialization` has done.
 */
export type SerializationHookType = (x: string) => string;

/**
 * String comparison function.
 * ```
 *   if (a < b) return -1
 *   if (a > b) return 1
 *   return 0
 * ```
 */
export type CompareStringsType = (a: string, b: string) => number;

