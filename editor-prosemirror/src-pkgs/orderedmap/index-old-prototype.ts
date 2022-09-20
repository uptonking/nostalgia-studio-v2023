/** Persistent data structure representing an ordered mapping from
 * strings to values, with some convenient update methods.
 */
export default function OrderedMap<T = any>(content: Array<string | T>) {
  // @ts-ignore
  this.content = content;
}

OrderedMap.prototype = {
  constructor: OrderedMap,

  find: function (key) {
    for (let i = 0; i < this.content.length; i += 2)
      if (this.content[i] === key) return i;
    return -1;
  },

  /** :: (string) → ?any
   * Retrieve the value stored under `key`, or return undefined when
   * no such key exists.
   */
  get: function (key) {
    const found = this.find(key);
    return found == -1 ? undefined : this.content[found + 1];
  },

  /** :: (string, any, ?string) → OrderedMap
   * Create a new map by replacing the value of `key` with a new
   * value, or adding a binding to the end of the map. If `newKey` is
   * given, the key of the binding will be replaced with that key.
   */
  update: function (key, value, newKey) {
    const self = newKey && newKey != key ? this.remove(newKey) : this;
    const found = self.find(key);
      const content = self.content.slice();
    if (found == -1) {
      content.push(newKey || key, value);
    } else {
      content[found + 1] = value;
      if (newKey) content[found] = newKey;
    }
    return new OrderedMap(content);
  },

  /** :: (string) → OrderedMap
   * Return a map with the given key removed, if it existed.
   */
  remove: function (key) {
    const found = this.find(key);
    if (found == -1) return this;
    const content = this.content.slice();
    content.splice(found, 2);
    return new OrderedMap(content);
  },

  /** :: (string, any) → OrderedMap
   * Add a new key to the start of the map.
   */
  addToStart: function (key, value) {
    return new OrderedMap([key, value].concat(this.remove(key).content));
  },

  /** :: (string, any) → OrderedMap
   * Add a new key to the end of the map.
   */
  addToEnd: function (key, value) {
    const content = this.remove(key).content.slice();
    content.push(key, value);
    return new OrderedMap(content);
  },

  /** :: (string, string, any) → OrderedMap
   * Add a key after the given key. If `place` is not found, the new
   * key is added to the end.
   */
  addBefore: function (place, key, value) {
    const without = this.remove(key);
      const content = without.content.slice();
    const found = without.find(place);
    content.splice(found == -1 ? content.length : found, 0, key, value);
    return new OrderedMap(content);
  },

  /** :: ((key: string, value: any))
   * Call the given function for each key/value pair in the map, in
   * order.
   */
  forEach: function (f) {
    for (let i = 0; i < this.content.length; i += 2)
      f(this.content[i], this.content[i + 1]);
  },

  /** :: (union<Object, OrderedMap>) → OrderedMap
   * Create a new map by prepending the keys in this map that don't
   * appear in `map` before the keys in `map`.
   */
  prepend: function (map) {
    map = OrderedMap.from(map);
    if (!map.size) return this;
    return new OrderedMap(map.content.concat(this.subtract(map).content));
  },

  /** :: (union<Object, OrderedMap>) → OrderedMap
   * Create a new map by appending the keys in this map that don't
   * appear in `map` after the keys in `map`.
   */
  append: function (map) {
    map = OrderedMap.from(map);
    if (!map.size) return this;
    return new OrderedMap(this.subtract(map).content.concat(map.content));
  },

  /** :: (union<Object, OrderedMap>) → OrderedMap
   * Create a map containing all the keys in this map that don't
   * appear in `map`.
   */
  subtract: function (map) {
    let result = this;
    map = OrderedMap.from(map);
    for (let i = 0; i < map.content.length; i += 2)
      result = result.remove(map.content[i]);
    return result;
  },

  /** :: number
   * The amount of keys in this map.
   */
  get size() {
    return this.content.length >> 1;
  },
};

/** :: (?union<Object, OrderedMap>) → OrderedMap
 * Return a map with the given content. If null, create an empty
 * map. If given an ordered map, return that map itself. If given an
 * object, create a map from the object's properties.
 */
OrderedMap.from = function (value) {
  if (value instanceof OrderedMap) return value;

  const content = [] as any[];
  if (value)
    for (const prop in value) {
      content.push(prop, value[prop]);
    }
  return new OrderedMap(content);
};
