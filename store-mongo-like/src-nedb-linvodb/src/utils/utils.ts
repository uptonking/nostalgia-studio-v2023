// https://youmightnotneed.com/lodash

/** Creates a function that is restricted to invoking func once.
 * - Repeat calls to the function return the value of the first invocation.
 */
export function once(fn) {
  let called = false;
  let result;
  return (...args) => {
    if (!called) {
      result = fn(...args);
      called = true;
    }
    return result;
  };
}

/**
 * Checks if path is a direct property of object.
 */
export function has(obj, path) {
  // Regex explained: https://regexr.com/58j0k
  const pathArray = Array.isArray(path) ? path : path.match(/([^[.\]])+/g);

  return Boolean(
    pathArray.reduce((prevObj, key) => prevObj && prevObj[key], obj),
  );
}
