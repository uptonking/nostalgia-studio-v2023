import { CodecRegistry } from '../../serialization/CodecRegistry';
import { type UndoableChange } from '../../types';
import { type Cell } from '../cell/Cell';
import { type GraphDataModel } from '../GraphDataModel';
import GenericChangeCodec from './GenericChangeCodec';

/**
 * Action to change a user object in a model.
 *
 * Constructs a change of a user object in the
 * specified model.
 *
 * @class ValueChange
 */
export class ValueChange implements UndoableChange {
  model: GraphDataModel;
  cell: Cell;
  value: unknown;
  previous: unknown;

  constructor(model: GraphDataModel, cell: Cell, value: unknown) {
    this.model = model;
    this.cell = cell;
    this.value = value;
    this.previous = value;
  }

  /**
   * Changes the value of {@link cell}` to {@link previous}` using
   * <Transactions.valueForCellChanged>.
   */
  execute() {
    this.value = this.previous;
    this.previous = this.model.valueForCellChanged(this.cell, this.previous);
  }
}

const __dummy: any = undefined;
CodecRegistry.register(
  new GenericChangeCodec(new ValueChange(__dummy, __dummy, __dummy), 'value'),
);
export default ValueChange;
