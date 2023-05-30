import { Dictionary } from '../../util/Dictionary';
import { Rectangle } from '../geometry/Rectangle';
import { type Shape } from '../geometry/Shape';
import { type Graph } from '../Graph';
import { type GraphView } from '../GraphView';
import { type Cell } from './Cell';
import { type CellState } from './CellState';

/**
 * Creates a temporary set of cell states.
 */
export class TemporaryCellStates {
  oldValidateCellState: Function | null;

  oldDoRedrawShape: Function | null;

  view: GraphView;

  /**
   * Holds the states of the rectangle.
   */
  oldStates: Dictionary<Cell, CellState>;

  /**
   * Holds the bounds of the rectangle.
   */
  oldBounds: Rectangle;

  /**
   * Holds the scale of the rectangle.
   */
  oldScale: number;

  constructor(
    view: GraphView,
    scale = 1,
    cells: Cell[],
    isCellVisibleFn: Function | null = null,
    getLinkForCellState: Function | null = null,
  ) {
    this.view = view;

    // Stores the previous state
    this.oldValidateCellState = view.validateCellState;
    this.oldBounds = view.getGraphBounds();
    this.oldStates = view.getStates();
    this.oldScale = view.getScale();
    this.oldDoRedrawShape = (<Graph>view.graph).cellRenderer.doRedrawShape;

    const self = this;

    // Overrides doRedrawShape and paint shape to add links on shapes
    if (getLinkForCellState != null) {
      (<Graph>view.graph).cellRenderer.doRedrawShape = (state: CellState) => {
        const shape = <Shape>state?.shape;
        const oldPaint = shape.paint;

        shape.paint = (c) => {
          const link = getLinkForCellState(state);
          if (link != null) {
            c.setLink(link);
          }
          oldPaint.apply(this, [c]);
          if (link != null) {
            c.setLink(null);
          }
        };

        (<Function>self.oldDoRedrawShape).apply(
          (<Graph>view.graph).cellRenderer,
          [state],
        );
        shape.paint = oldPaint;
      };
    }

    // Overrides validateCellState to ignore invisible cells
    view.validateCellState = (cell, recurse) => {
      if (cell == null || isCellVisibleFn == null || isCellVisibleFn(cell)) {
        return (<Function>self.oldDoRedrawShape).apply(view, [cell, recurse]);
      }
      return null;
    };

    // Creates space for new states
    view.setStates(new Dictionary());
    view.setScale(scale);

    view.resetValidationState();
    let bbox = null;

    // Validates the vertices and edges without adding them to
    // the model so that the original cells are not modified
    for (const cell of cells) {
      const bounds = view.getBoundingBox(
        view.validateCellState(<Cell>view.validateCell(<Cell>cell)),
      );
      if (bbox == null) {
        bbox = bounds;
      } else {
        bbox.add(<Rectangle>bounds);
      }
    }
    view.setGraphBounds(bbox || new Rectangle());
  }

  destroy(): void {
    const view = this.view;
    view.setScale(this.oldScale);
    view.setStates(this.oldStates);
    view.setGraphBounds(this.oldBounds);
    // @ts-ignore
    view.validateCellState = <Function>this.oldValidateCellState;
    // @ts-ignore
    view.graph.cellRenderer.doRedrawShape = <Function>this.oldDoRedrawShape;
  }
}

export default TemporaryCellStates;
