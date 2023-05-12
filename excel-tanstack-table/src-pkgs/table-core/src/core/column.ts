import type {
  AccessorFn,
  Column,
  ColumnDef,
  ColumnDefResolved,
  RowData,
  Table,
} from '../types';
import { memo } from '../utils';

export interface CoreColumn<TData extends RowData, TValue> {
  /** The resolved unique identifier for the column resolved in this priority:
   * - A manual `id` property from the column def
   * - The `accessorKey` from the column def
   * - The `header` string from the column def
   */
  id: string;
  /** The depth of the column (if grouped) relative to the root column def array.
   */
  depth: number;
  accessorFn?: AccessorFn<TData, TValue>;
  /** The original column def used to create the column. */
  columnDef: ColumnDef<TData, TValue>;
  /** The child column (if the column is a group column).
   * - Will be an empty array if the column is not a group column.
   */
  columns: Column<TData, TValue>[];
  /** parent column for this column. Will be `undefined` if this is a root column. */
  parent?: Column<TData, TValue>;
  /** Returns the flattened array of this column and all child/grand-child columns for this column. */
  getFlatColumns: () => Column<TData, TValue>[];
  /** Returns an array of all leaf-node columns for this column.
   * - If a column has no children, it is considered the only leaf-node column. */
  getLeafColumns: () => Column<TData, TValue>[];
}

/** create a column by columnDef
 * - accessorKey doesnot exist in column, it's converted to accessorFn
 */
export function createColumn<TData extends RowData, TValue>(
  table: Table<TData>,
  columnDef: ColumnDef<TData, TValue>,
  depth: number,
  parent?: Column<TData, TValue>,
): Column<TData, TValue> {
  const defaultColumn = table._getDefaultColumnDef();

  const resolvedColumnDef = {
    ...defaultColumn,
    ...columnDef,
  } as ColumnDefResolved<TData>;

  const accessorKey = resolvedColumnDef.accessorKey;

  let id =
    resolvedColumnDef.id ??
    (accessorKey ? accessorKey.replace('.', '_') : undefined) ??
    (typeof resolvedColumnDef.header === 'string'
      ? resolvedColumnDef.header
      : undefined);

  let accessorFn: AccessorFn<TData> | undefined;

  if (resolvedColumnDef.accessorFn) {
    accessorFn = resolvedColumnDef.accessorFn;
  } else if (accessorKey) {
    // Support deep accessor keys
    if (accessorKey.includes('.')) {
      accessorFn = (originalRow: TData) => {
        let result = originalRow as Record<string, any>;

        for (const key of accessorKey.split('.')) {
          result = result?.[key];
          if (process.env.NODE_ENV !== 'production' && result === undefined) {
            console.warn(
              `"${key}" in deeply nested key "${accessorKey}" returned undefined.`,
            );
          }
        }

        return result;
      };
    } else {
      accessorFn = (originalRow: TData) =>
        (originalRow as any)[resolvedColumnDef.accessorKey];
    }
  }

  if (!id) {
    if (process.env.NODE_ENV !== 'production') {
      throw new Error(
        resolvedColumnDef.accessorFn
          ? `Columns require an id when using an accessorFn`
          : `Columns require an id when using a non-string header`,
      );
    }
    throw new Error();
  }

  let column: CoreColumn<TData, any> = {
    id: `${String(id)}`,
    accessorFn,
    parent: parent as any,
    depth,
    columnDef: resolvedColumnDef as ColumnDef<TData, any>,
    columns: [],
    getFlatColumns: memo(
      () => [true],
      () => {
        return [
          column as Column<TData, TValue>,
          // eslint-disable-next-line no-unsafe-optional-chaining
          ...column.columns?.flatMap((d) => d.getFlatColumns()),
        ];
      },
      {
        key: process.env.NODE_ENV === 'production' && 'column.getFlatColumns',
        debug: () => table.options.debugAll ?? table.options.debugColumns,
      },
    ),
    getLeafColumns: memo(
      () => [table._getOrderColumnsFn()],
      (orderColumns) => {
        if (column.columns?.length) {
          let leafColumns = column.columns.flatMap((column) =>
            column.getLeafColumns(),
          );

          return orderColumns(leafColumns);
        }

        return [column as Column<TData, TValue>];
      },
      {
        key: process.env.NODE_ENV === 'production' && 'column.getLeafColumns',
        debug: () => table.options.debugAll ?? table.options.debugColumns,
      },
    ),
  };

  column = table._features.reduce((obj, feature) => {
    return Object.assign(obj, feature.createColumn?.(column, table));
  }, column);

  // Yes, we have to convert table to uknown, because we know more than the compiler here.
  return column as Column<TData, TValue>;
}
