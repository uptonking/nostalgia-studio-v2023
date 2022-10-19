import { EventEmitter } from 'node:events';

// import { TextOperation } from '../src/text-operation';
import { WrappedOperation } from '../src/wrapped-operation';

/**
 * Takes current document as a string and optionally the array of all operations.
 * - 这里继承nodejs内置的EventEmitter是为了给子类用，子类不能多继承
 */
export class Orchestrator extends EventEmitter {
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
   */
  receiveOperation(revision: number, operation: WrappedOperation) {
    if (revision < 0 || this.operations.length < revision) {
      throw new Error('operation revision not in history');
    }
    // Find all operations that the client didn't know of when it sent the operation ...
    // 获取多端基于同版本同时发送到服务端的操作
    const concurrentOperations = this.operations.slice(revision);
    // ... and transform the operation against all these operations ...
    // const transform = operation.constructor.transform;
    const transform = WrappedOperation.transform;
    for (let i = 0; i < concurrentOperations.length; i++) {
      operation = transform(operation, concurrentOperations[i])[0];
    }

    // ... and apply that on the document. 得到服务端最新且正确的文档
    this.document = operation.apply(this.document);
    // Store operation in history.
    this.operations.push(operation);

    // It's the caller's responsibility to send the operation to all connected
    // clients and an acknowledgement to the creator.
    return operation;
  }
}
