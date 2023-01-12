import { EventEmitter } from './event-emitter';

export type BagpipeOptions = {
  /** use ratio with limit */
  ratio?: number;
  /** default false. 拒绝模式，排队超过限制值时，新来的调用会抛出`TooMuchAsyncCallError`异常 */
  refuse?: boolean;
  /** 默认为null不开启。 setting global async call timeout. If async call doesn't complete in time, will execute the callback with `BagpipeTimeoutError` exception */
  timeout?: any;
  /** 禁用限流，测试时用；if true, func called immediately */
  disabled?: boolean;
};

/** make it easy to limit the amount of concurrent.
 * - Bagpipe delivers invoke into inner queue through `push`.
 * - If active invoke amount is less than max concurrent, it will be popped and executed directly, or it will stay in the queue.
 * - When an asynchronous invoke ends, a invoke in the head of the queue will be popped and executed, such that assures active asynchronous invoke amount no larger than restricted value.
 * - When the queue length is larger than 1, Bagpipe object will fire its `full` event, which delivers the queue length value.
 */
export class Bagpipe extends EventEmitter {
  /** if 0, fn called immediately */
  limit: number;
  active: number;
  paused: boolean;
  stopped: boolean;
  /** async tasks queue */
  queue: Array<{ method: any; args: any[] }>;
  /** `queueLength = limit * ratio` */
  readonly queueLengthMax: number;
  options: BagpipeOptions;

  _locked: Record<string, any>;
  _locks: Record<string, any>;

  /**
   * 构造器，传入限流值，设置异步调用最大并发数
   * Examples:
   * ```
   * var bagpipe = new Bagpipe(100);
   * bagpipe.push(fs.readFile, 'path', 'utf-8', function (err, data) {
   *   // TODO
   * });
   * ```
   * Events:
   * - `full`, 当活动异步达到限制值时，后续异步调用将被暂存于队列中。当队列的长度大于限制值的2倍或100的时候时候，触发`full`事件。事件传递队列长度值。
   * - `outdated`, 超时后的异步调用异常返回。
   * @param {Number} limit 并发数限制值
   * @param {Object} options Options
   */
  constructor(limit: number, options: boolean | BagpipeOptions = {}) {
    super();
    this.limit = limit;
    this.active = 0;
    this.paused = false;
    this.stopped = false;
    this.queue = [];
    this.options = {
      refuse: false,
      ratio: 1,
      timeout: null,
      disabled: false,
    };
    if (typeof options === 'boolean') {
      options = {
        disabled: options,
      };
    }
    for (const key in this.options) {
      if (Object.hasOwn(options, key)) {
        this.options[key] = options[key];
      }
    }
    this.queueLengthMax = Math.round(this.limit * (this.options.ratio || 1));
  }

  /**
   * @internal 推入方法，参数。最后一个参数为回调函数
   * @param {Function} method 异步方法
   * @param {Mix} args 参数列表，最后一个参数为回调函数。
   */
  addToQueue(unshift: number, ...args: any[]) {
    return (method: (...params: any[]) => any) => {
      if (this.stopped) return this;

      const callback = args[args.length - 1];
      if (typeof callback !== 'function') {
        args.push(() => {});
      }
      if (this.options.disabled || this.limit < 1) {
        method.apply(null, args);
        return this;
      }

      if (this.queue.length < this.queueLengthMax || !this.options.refuse) {
        this.queue[unshift ? 'unshift' : 'push']({
          method: method,
          args: args,
        });
      } else {
        // 队列长度超过限制值时
        const err = new Error('Too much async call in queue');
        err.name = 'TooMuchAsyncCallError';
        callback(err);
      }

      if (this.queue.length > 1) {
        this.emit('full', this.queue.length);
      }

      this.next();
      return this;
    };
  }

  /** add task-method to the end of the queue, then exec the first item in the queue
   * - splits method/parameter/callback, then delivery it to bagpipe through `push`
   * - the last item in `args` is callback after method
   */
  push(method: (...params: any[]) => any, ...args: any[]) {
    this.addToQueue(0, ...args)(method);
  }
  unshift(method: (...params: any[]) => any, ...args: any[]) {
    this.addToQueue(1, ...args)(method);
  }

  pause() {
    this.paused = true;
  }
  resume() {
    this.paused = false;
    if (!this.stopped) this.next();
  }

  stop() {
    this.stopped = true;
    this.queue = [];
    this.active = 0;
    this.pause();
  }
  start() {
    this.stopped = false;
    this.resume();
  }

  /**
   * exec the first item in this.queue, recursively
   */
  next() {
    if (this.stopped) return;
    if (this.paused) return;

    if (this.active < this.limit && this.queue.length) {
      const task = this.queue.shift();
      this.run(task.method, task.args);
    }
  }

  _next() {
    if (this.stopped) return;
    this.active--;
    this.next();
  }

  /**
   * exec task recursively
   * - all tasks are exec using setTimeout(task,  0)
   */
  run(method: (...params: any[]) => any, args: any[]) {
    if (this.stopped) return;

    this.active++;
    const callback = args[args.length - 1];
    let timer = null;
    let called = false;

    // inject logic to enhance callback function
    args[args.length - 1] = (err, ...args1) => {
      if (this.stopped) return;

      // anyway, clear the timer
      if (timer) {
        clearTimeout(timer);
        timer = null;
      }
      // if timeout, don't execute
      if (!called) {
        // 👇🏻 before exec callback for current task, put next task using microtask
        this._next();
        callback.apply(null, [err, ...args1]);
        // callback.apply(null, arguments); // 👀 arguments === [err, ...args1
      } else {
        // pass the outdated error
        if (err) {
          this.emit('outdated', err);
        }
      }
    };

    const timeout = this.options.timeout;
    if (this.stopped) return;

    if (timeout) {
      timer = setTimeout(() => {
        if (this.stopped) return callback();

        // set called as true
        called = true;
        this._next();
        // pass the exception
        const err = new Error(timeout + 'ms timeout');
        err['name'] = 'BagpipeTimeoutError';
        err['data'] = {
          name: method.name,
          method: method.toString(),
          args: args.slice(0, -1),
        };
        callback(err);
      }, timeout);
    }
    setTimeout(() => {
      // callback will be passed to method
      method.apply(null, args);
    }, 0);
  }
}
