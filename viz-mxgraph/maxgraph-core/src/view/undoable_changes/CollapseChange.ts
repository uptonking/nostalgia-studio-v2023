import CodecRegistry from '../../serialization/CodecRegistry';
import { type UndoableChange } from '../../types';
import { type Cell } from '../cell/Cell';
import { type GraphDataModel } from '../GraphDataModel';
import GenericChangeCodec from './GenericChangeCodec';

/**
 * Action to change a cell's collapsed state in a model.
 *
 * Constructor: mxCollapseChange
 *
 * Constructs a change of a collapsed state in the
 * specified model.
 */
export class CollapseChange implements UndoableChange {
  model: GraphDataModel;
  cell: Cell;
  collapsed: boolean;
  previous: boolean;

  constructor(model: GraphDataModel, cell: Cell, collapsed: boolean) {
    this.model = model;
    this.cell = cell;
    this.collapsed = collapsed;
    this.previous = collapsed;
  }

  /**
   * Changes the collapsed state of {@link cell}` to {@link previous}` using
   * <Transactions.collapsedStateForCellChanged>.
   */
  execute() {
    this.collapsed = this.previous;
    this.previous = this.model.collapsedStateForCellChanged(
      this.cell,
      this.previous,
    );
  }
}

const __dummy: any = undefined;
CodecRegistry.register(
  new GenericChangeCodec(
    new CollapseChange(__dummy, __dummy, __dummy),
    'collapsed',
  ),
);
export default CollapseChange;
