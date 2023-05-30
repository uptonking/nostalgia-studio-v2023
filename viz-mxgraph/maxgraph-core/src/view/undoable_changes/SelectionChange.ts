import { type UndoableChange } from '../../types';
import Translations from '../../util/Translations';
import { type Cell } from '../cell/Cell';
import EventObject from '../event/EventObject';
import InternalEvent from '../event/InternalEvent';
import { type Graph } from '../Graph';

/**
 * @class SelectionChange
 * Action to change the current root in a view.
 */
export class SelectionChange implements UndoableChange {
  constructor(graph: Graph, added: Cell[] = [], removed: Cell[] = []) {
    this.graph = graph;
    this.added = added.slice();
    this.removed = removed.slice();
  }

  graph: Graph;

  added: Cell[];

  removed: Cell[];

  /**
   * Changes the current root of the view.
   */
  execute() {
    const selectionModel = this.graph.getSelectionModel();
    window.status =
      Translations.get(selectionModel.updatingSelectionResource) ||
      selectionModel.updatingSelectionResource;

    for (const removed of this.removed) {
      selectionModel.cellRemoved(removed);
    }

    for (const added of this.added) {
      selectionModel.cellAdded(added);
    }

    [this.added, this.removed] = [this.removed, this.added];

    window.status =
      Translations.get(selectionModel.doneResource) ||
      selectionModel.doneResource;

    selectionModel.fireEvent(
      new EventObject(InternalEvent.CHANGE, {
        added: this.added,
        removed: this.removed,
      }),
    );
  }
}

export default SelectionChange;
