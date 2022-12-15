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

  /**
   * @deprecated legacy promise-then impl;
   * @see waterfall
   */
  waterfall1(func: AsyncFunction): AsyncFunction {
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

  /** 返回一个返回值是Promise的函数，会在这个函数中执行func
   * - 不会立即执行func
   *
   * ? 性能似乎降低了
   */
  waterfall(func: AsyncFunction): AsyncFunction {
    return (...args) => {
      // const p1 = (async () => {
      this.guardian = (async () => {
        try {
          await this.guardian;
          const result = await func(...args);
          return { error: false, result };
        } catch (err) {
          return { error: true, result: err };
        }
      })();

      const p2 = (async () => {
        try {
          // const { error, result } = await p1;
          const { error, result } = await this.guardian;
          return error ? Promise.reject(result) : result;
        } catch (err) {
          console.error(';; waterfall-err ', err);
          // return Promise.reject(err);
        }
      })();

      return p2;
    };
  }

  /** Shorthand for chaining a promise to the Waterfall
   */
  chain(promise: Promise<unknown>): Promise<unknown> {
    return this.waterfall(() => promise)();
  }
}
