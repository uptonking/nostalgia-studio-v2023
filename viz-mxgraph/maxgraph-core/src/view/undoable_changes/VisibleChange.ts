import { CodecRegistry } from '../../serialization/CodecRegistry';
import { type UndoableChange } from '../../types';
import { type Cell } from '../cell/Cell';
import { type GraphDataModel } from '../GraphDataModel';
import { GenericChangeCodec } from './GenericChangeCodec';

/**
 * Action to change a cell's visible state in a model.
 *
 * Constructor: mxVisibleChange
 *
 * Constructs a change of a visible state in the
 * specified model.
 */
export class VisibleChange implements UndoableChange {
  model: GraphDataModel;
  cell: Cell;
  visible: boolean;
  previous: boolean;

  constructor(model: GraphDataModel, cell: Cell, visible: boolean) {
    this.model = model;
    this.cell = cell;
    this.visible = visible;
    this.previous = visible;
  }

  /**
   * Changes the visible state of {@link cell}` to {@link previous}` using
   * <Transactions.visibleStateForCellChanged>.
   */
  execute() {
    this.visible = this.previous;
    this.previous = this.model.visibleStateForCellChanged(
      this.cell,
      this.previous,
    );
  }
}

const __dummy: any = undefined;
CodecRegistry.register(
  new GenericChangeCodec(
    new VisibleChange(__dummy, __dummy, __dummy),
    'visible',
  ),
);
export default VisibleChange;
