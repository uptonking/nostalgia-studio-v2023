import type { Cell, Column, Row, RowData, Table } from '../types';
import { type Getter, memo } from '../utils';

export interface CellContext<TData extends RowData, TValue> {
  table: Table<TData>;
  column: Column<TData, TValue>;
  row: Row<TData>;
  cell: Cell<TData, TValue>;
  getValue: Getter<TValue>;
  renderValue: Getter<TValue | null>;
}

export interface CoreCell<TData extends RowData, TValue> {
  /** unique ID for the cell across the entire table. */
  id: string;
  /** Returns the value for the cell, accessed via the associated column's accessor key or accessor function. */
  getValue: CellContext<TData, TValue>['getValue'];
  /** return getValue if it exists, otherwise return renderFallbackValue */
  renderValue: CellContext<TData, TValue>['renderValue'];
  /** associated Row object for the cell. */
  row: Row<TData>;
  /** associated Column object for the cell. */
  column: Column<TData, TValue>;
  /** Returns the rendering context (or props) for cell-based components like cells and aggregated cells. */
  getContext: () => CellContext<TData, TValue>;
}

export function createCell<TData extends RowData, TValue>(
  table: Table<TData>,
  row: Row<TData>,
  column: Column<TData, TValue>,
  columnId: string,
): Cell<TData, TValue> {
  const getRenderValue = () =>
    cell.getValue() ?? table.options.renderFallbackValue;

  const cell: CoreCell<TData, TValue> = {
    id: `${row.id}_${column.id}`,
    row,
    column,
    getValue: () => row.getValue(columnId),
    renderValue: getRenderValue,
    getContext: memo(
      () => [table, column, row, cell],
      (table, column, row, cell) => ({
        table,
        column,
        row,
        cell: cell as Cell<TData, TValue>,
        getValue: cell.getValue,
        renderValue: cell.renderValue,
      }),
      {
        key: process.env.NODE_ENV === 'development' && 'cell.getContext',
        debug: () => table.options.debugAll,
      },
    ),
  };

  // enhance `cell` with feature
  table._features.forEach((feature) => {
    Object.assign(
      cell,
      feature.createCell?.(
        cell as Cell<TData, TValue>,
        column,
        row as Row<TData>,
        table,
      ),
    );
  }, {});

  return cell as Cell<TData, TValue>;
}
