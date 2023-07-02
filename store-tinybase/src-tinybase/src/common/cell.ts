import { type Id } from '../common-d';
import { type Cell, type CellOrUndefined, type Store } from '../store-d';
import { isFiniteNumber, isTypeStringOrBoolean, isUndefined } from './other';
import { getTypeOf, NUMBER } from './strings';

export const getCellType = (cell: Cell | undefined): string | undefined => {
  const type = getTypeOf(cell);
  return isTypeStringOrBoolean(type) ||
    (type == NUMBER && isFiniteNumber(cell as any))
    ? type
    : undefined;
};

export const setOrDelCell = (
  store: Store,
  tableId: Id,
  rowId: Id,
  cellId: Id,
  cell: CellOrUndefined,
) =>
  isUndefined(cell)
    ? store.delCell(tableId, rowId, cellId, true)
    : store.setCell(tableId, rowId, cellId, cell);
