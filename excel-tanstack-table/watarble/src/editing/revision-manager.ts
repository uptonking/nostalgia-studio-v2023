import { type UID } from '../types';
import { Operation, Revision } from './revision';

/**
 * manager of operations
 */
export class RevisionManager<T = unknown> {
  private revisions: Array<Operation<T>> = [];

  private readonly applyOperation: (data: T) => void;
  private readonly revertOperation: (data: T) => void;

  constructor(options: {
    initialOperationId: UID;
    applyOperation?: (data: T) => void;
    revertOperation?: (data: T) => void;
  }) {
    this.applyOperation = options.applyOperation;
    this.revertOperation = options.revertOperation;
    const initialOperationId = options.initialOperationId;
    const initialOp = new Operation(
      initialOperationId,
      new Revision(initialOperationId, 'empty', []),
    );
    this.revisions.push(initialOp as Operation<T>);
  }

  get(opId: UID): T {
    return this.revisions.find((rev) => rev['id'] === opId)?.data;
  }

  append(operationId: UID, data: T) {
    const op = new Operation(operationId, data);
    this.revisions.push(op);
  }

  undo(opId: UID, undoId: UID, insertAfter: UID) {
    const op = this.revisions.find((rev) => rev.id === opId);
    if (op) {
      this.revertOperation(op.data);
    }
  }

  redo(opId: UID, redoId: UID, insertAfter: UID) {
    const op = this.revisions.find((rev) => rev.id === opId);
    if (op) {
      this.applyOperation(op.data);
    }
  }
}
