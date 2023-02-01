import { EventEmitter } from 'node:events';

import { WrappedOperation } from '../src/wrapped-operation';
// import { TextOperation } from '../src/text-operation';

/**
 * Takes current document as a string and optionally the array of all operations.
 * - 服务端按op接收顺序串行处理，第一op立即ack，后面的op会让对应客户端处于awaitingConfirm状态，
 *  此时后面对应的客户端可能先收到第一个op而需要在本地ot转换，后面的op发送时就已经转换过了
 * - 注意理解，服务端返回的第一op在其他客户端需要ot转换，服务端返回的后面的ot在客户端同步状态下可在客户端直接执行而无需转换
 * - 优点是，客户端的op一般只需发送一次，且对操作能保存意图
 * - 这里继承nodejs内置的EventEmitter是为了给子类用，子类不能多继承
 */
export class OpOrchestrator extends EventEmitter {
  /** 放在内存中的全局文档内容字符串，未持久化，方便新加入客户端能直接获取到最新内容 */
  document: string;
  /** 全局文档的编辑操作记录，注意内存溢出问题 */
  operations: WrappedOperation[];

  constructor(document: string, operations: WrappedOperation[]) {
    super();
    this.document = document;
    this.operations = operations || [];
  }

  /**
   * Call this method whenever you receive an operation from a client.
   * - 客户端后发来的操作oA，服务端已执行基于同版本文档的oB， transform(oA, oB) => (oA', oB')
   * - 服务端应该执行的操作是oA'
   */
  receiveOperation(revision: number, operation: WrappedOperation) {
    if (revision < 0 || revision > this.operations.length) {
      throw new Error('operation revision not in history');
    }
    /** 发来的操作对应的会在服务端执行的形式 */
    let oAPrime = operation;
    // Find all operations that the client didn't know of when it sent the operation ...
    // 获取多端基于同版本同时发送到服务端的操作进行ot，若无就跳过
    const concurrentOperations = this.operations.slice(revision);
    // ... and transform the operation against all these operations ...
    // const transform = operation.constructor.transform;
    const transform = WrappedOperation.transform;
    for (let i = 0; i < concurrentOperations.length; i++) {
      oAPrime = transform(oAPrime, concurrentOperations[i])[0];
    }

    // ... and apply that on the document. 得到服务端最新且正确的文档
    this.document = oAPrime.apply(this.document);
    // Store operation in history.
    this.operations.push(oAPrime);

    // It's the caller's responsibility to send the operation to all connected
    // clients and an acknowledgement to the creator.
    return oAPrime;
  }
}
