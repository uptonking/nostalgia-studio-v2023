
/** Creates a function that is restricted to invoking func once.
 * - Repeat calls to the function return the value of the first invocation.
 */
export function once(fn) {
  let called = false
  let result
  return (...args) => {
    if (!called) {
      result = fn(...args)
      called = true
    }
    return result
  }
}
