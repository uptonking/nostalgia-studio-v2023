import { type AsyncFunction } from './types/common';
import { Waterfall } from './waterfall';

/**
 * Executes operations sequentially.
 * - Has an option for a buffer that can be triggered afterwards.
 * @internal
 */
export class Executor {
  /**
   * If `false`, then every task pushed will be buffered until `this.processBuffer` is called.
   * @internal
   */
  public ready = false;
  /**
   * The main queue
   * @internal
   */
  public queue: Waterfall;
  /**
   * The buffer queue
   */
  private buffer: Waterfall;
  /**
   * Method to trigger the buffer processing.
   * - Do not be use directly, use `this.processBuffer` instead.
   */
  private _triggerBuffer: (x?: any) => void;

  /**
   * Instantiates a new Executor.
   */
  constructor() {
    this.ready = false;
    this.queue = new Waterfall();
    this.buffer = null;
    this._triggerBuffer = null;
    this.resetBuffer(); // also init this.buffer
  }

  /**
   * If executor is ready, queue task (and process it immediately if executor was idle)
   * - If not ready, buffer task for later processing
   * @param {AsyncFunction} task Function to execute
   * @param {boolean} [forceQueuing = false] Optional (defaults to false) force executor to queue task even if it is not ready
   */
  async pushAsync(task: AsyncFunction, forceQueuing = false): Promise<any> {
    if (this.ready || forceQueuing) {
      return this.queue.waterfall(task)();
    } else {
      return this.buffer.waterfall(task)();
    }
  }

  /**
   * Queue all tasks in buffer (in the same order they came in)
   * - Automatically sets executor as ready
   */
  processBuffer() {
    this.ready = true;
    this._triggerBuffer();
    this.queue.waterfall(() => this.buffer.guardian);
  }

  /**
   * Removes all tasks queued up in the buffer
   * - `this.buffer = new Waterfall();`, then this._triggerBuffer();
   */
  resetBuffer() {
    this.buffer = new Waterfall();
    this.buffer.chain(
      new Promise((resolve) => {
        this._triggerBuffer = resolve;
      }),
    );

    if (this.ready) {
      this._triggerBuffer();
    }
  }
}
