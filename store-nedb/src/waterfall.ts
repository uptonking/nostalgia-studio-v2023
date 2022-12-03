/**
 * Responsible for sequentially executing actions on the database
 * @internal
 */
export class Waterfall {
  /**  */
  guardian: Promise<any>;

  constructor() {
    /**
     * This is the internal Promise object which resolves when all the tasks of the `Waterfall` are done.
     *
     * It will change any time `this.waterfall` is called.
     *
     * @type {Promise}
     */
    this.guardian = Promise.resolve();
  }

  /** 先执行 func，然后返回一个promise
   *
   * @param {AsyncFunction} func
   * @return {AsyncFunction}
   */
  waterfall(func) {
    return (...args) => {
      this.guardian = this.guardian.then(() => {
        return func(...args).then(
          (result) => ({ error: false, result }),
          (result) => ({ error: true, result }),
        );
      });
      return this.guardian.then(({ error, result }) => {
        if (error) return Promise.reject(result);
        else return Promise.resolve(result);
      });
    };
  }

  /**
   * Shorthand for chaining a promise to the Waterfall
   * @param {Promise} promise
   * @return {Promise}
   */
  chain(promise) {
    return this.waterfall(() => promise)();
  }
}
