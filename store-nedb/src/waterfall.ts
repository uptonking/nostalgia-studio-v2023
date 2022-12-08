import type { AsyncFunction } from './types/common';

/**
 * Responsible for sequentially executing actions on the database
 * @internal
 */
export class Waterfall {
  /** This is the internal Promise object which resolves when all the tasks of the `Waterfall` are done.
   * - It will change anytime `this.waterfall()` is called.
   */
  public guardian: Promise<any>;

  constructor() {
    this.guardian = Promise.resolve();
  }

  /** 先执行 func，然后返回一个函数，这个函数返回值是Promise
   */
  waterfall(func: AsyncFunction): AsyncFunction {
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
   */
  chain(promise: Promise<any>): Promise<any> {
    return this.waterfall(() => promise)();
  }
}
