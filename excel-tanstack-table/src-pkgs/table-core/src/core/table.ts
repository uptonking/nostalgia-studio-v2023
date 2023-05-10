import { ColumnSizing } from '../features/ColumnSizing';
import { Expanding } from '../features/Expanding';
import { Filters } from '../features/Filters';
import { Grouping } from '../features/Grouping';
import { Ordering } from '../features/Ordering';
import { Pagination } from '../features/Pagination';
import { Pinning } from '../features/Pinning';
import { RowSelection } from '../features/RowSelection';
import { Sorting } from '../features/Sorting';
import { Visibility } from '../features/Visibility';
import type {
  Column,
  ColumnDef,
  ColumnDefResolved,
  GroupColumnDef,
  InitialTableState,
  Row,
  RowData,
  RowModel,
  Table,
  TableMeta,
  TableOptions,
  TableOptionsResolved,
  TableState,
  Updater,
} from '../types';
import { functionalUpdate, memo, type RequiredKeys } from '../utils';
//
import { createColumn } from './column';
import { Headers } from './headers';

export interface TableFeature {
  getDefaultOptions?: (table: any) => any;
  getInitialState?: (initialState?: InitialTableState) => any;
  createTable?: (table: any) => any;
  getDefaultColumnDef?: () => any;
  createColumn?: (column: any, table: any) => any;
  createHeader?: (column: any, table: any) => any;
  createCell?: (cell: any, column: any, row: any, table: any) => any;
  createRow?: (row: any, table: any) => any;
}

/** features array */
const features = [
  Headers,
  Visibility,
  Ordering,
  Pinning,
  Filters,
  Sorting,
  Grouping,
  Expanding,
  Pagination,
  RowSelection,
  ColumnSizing,
] as const;

//

export interface CoreTableState {}

export interface CoreOptions<TData extends RowData> {
  /** data for the table to display. This array should match the type you provided to `table.setRowType<...>`
   * - When the `data` option changes reference (compared via `Object.is`), the table will reprocess the data.
   * - Make sure your data option is only changing when you want the table to reprocess.
   */
  data: TData[];
  /** array of column defs for the table */
  columns: ColumnDef<TData, any>[];
  /** Default column options to use for all column defs
   * - useful for providing default cell/header/footer renderers, sorting/filtering/grouping options, etc
   * - All column definitions passed to `options.columns` are merged with this default column definition to produce the final column definitions.
   */
  defaultColumn?: Partial<ColumnDef<TData, unknown>>;
  /** used when resetting various table states either automatically by the table (eg. options.autoResetPageIndex) or via functions like table.resetRowSelection().
   * - Table state will not be reset when this object changes, which also means that the initial state object does not need to be stable
   */
  initialState?: InitialTableState;
  /** used to optionally control part or all of the table state.
   * - The state you pass here will merge with and overwrite the internal automatically-managed state to produce the final state for the table.
   */
  state: Partial<TableState>;
  /** used to listen to state changes within the table.
   * - If you provide this options, you will be responsible for controlling and updating the table state yourself.
   */
  onStateChange: (updater: Updater<TableState>) => void;
  /** Set this option to override any of the `autoReset...` feature options. */
  autoResetAll?: boolean;
  /** implement the merging of table options.
   * - Some framework like solid-js use proxies to track reactivity and usage, so merging reactive objects needs to be handled carefully.
   * - This option inverts control of this process to the adapter.
   */
  mergeOptions?: (
    defaultOptions: TableOptions<TData>,
    options: Partial<TableOptions<TData>>,
  ) => TableOptions<TData>;
  /** You can pass any object to `options.meta` and access it anywhere the table is available via `table.options.meta`
   * - Think of this option as an arbitrary "context" for your table.
   * - A good example is passing a locale object to your table to use for formatting dates, numbers, etc or even a function that can be used to update editable data
   */
  meta?: TableMeta<TData>;
  /** computes and returns the core row model for the table.
   * - It is called once per table and should return a new function which will calculate and return the row model for the table.
   */
  getCoreRowModel: (table: Table<any>) => () => RowModel<any>;
  /** used to access the sub rows for any given row. */
  getSubRows?: (originalRow: TData, index: number) => undefined | TData[];
  /** get a unique ID for any given row.
   * - If not provided, the rows index is used (nested rows join together with `.` using their grandparents' index
   * - If you need to identify individual rows that are originating from any server-side operations, it's suggested you use this function to return an ID
   */
  getRowId?: (originalRow: TData, index: number, parent?: Row<TData>) => string;
  renderFallbackValue: any;
  /** provides a renderer implementation for the table. This implementation is used to turn a table's various column header and cell templates into a result that is supported by the user's framework. */
  render?: <TProps>(template: any, props: TProps) => any;

  /** Set this option to true to output all debugging information to the console. */
  debugAll?: boolean;
  debugTable?: boolean;
  debugHeaders?: boolean;
  debugColumns?: boolean;
  debugRows?: boolean;
}

export interface CoreInstance<TData extends RowData> {
  /** resolved initial state of the table. */
  initialState: TableState;
  /** reset the table state to the initial state. */
  reset: () => void;
  /** A read-only reference to the table's current options.
   * - This property is generally used internally or by adapters.
   */
  options: RequiredKeys<TableOptionsResolved<TData>, 'state'>;
  /** generally used by adapters to update the table options.
   * - This function is generally used by adapters to update the table options. It can be used to update the table options directly, but it is generally not recommended to bypass your adapters strategy for updating table options.
   */
  setOptions: (newOptions: Updater<TableOptionsResolved<TData>>) => void;
  /** get the table's current state.  */
  getState: () => TableState;
  /** update the table state.
   * - It's recommended you pass an updater function in the form of `(prevState) => newState` to update the state, but a direct object can also be passed.
   * - If `options.onStateChange` is provided, it will be triggered by this function with the new state.
   */
  setState: (updater: Updater<TableState>) => void;
  _features: readonly TableFeature[];
  /** add cb to taskQueue, and exec the cb if no task is running */
  _queue: (cb: () => void) => void;
  _getRowId: (_: TData, index: number, parent?: Row<TData>) => string;
  /** Returns the core row model before any processing has been applied. */
  getCoreRowModel: () => RowModel<TData>;
  _getCoreRowModel?: () => RowModel<TData>;
  /** Returns the final model after all processing from other used features has been applied. */
  getRowModel: () => RowModel<TData>;
  getRow: (id: string) => Row<TData>;
  _getDefaultColumnDef: () => Partial<ColumnDef<TData, unknown>>;
  _getColumnDefs: () => ColumnDef<TData, unknown>[];
  _getAllFlatColumnsById: () => Record<string, Column<TData, unknown>>;
  /** Returns all columns in the table in their normalized and nested hierarchy, mirrored from the column defs  */
  getAllColumns: () => Column<TData, unknown>[];
  /** Returns all columns in the table flattened to a single level. This includes parent column objects throughout the hierarchy. */
  getAllFlatColumns: () => Column<TData, unknown>[];
  /** Returns all leaf-node columns in the table flattened to a single level. This does not include parent columns. */
  getAllLeafColumns: () => Column<TData, unknown>[];
  /** Returns a single column by its ID. */
  getColumn: (columnId: string) => Column<TData, unknown> | undefined;
}

/**
 * createTable workflow
 * - compute table options，合并features options
 * - compute table initialState，合并features initialState
 * - add core props and methods to table instance
 * - 逐个执行插件的createTable方法，将table实例作为参数传入来增强
 */
export function createTable<TData extends RowData>(
  options: TableOptionsResolved<TData>,
): Table<TData> {
  if (options.debugAll || options.debugTable) {
    console.info('Creating Table Instance...');
  }

  /** the table instance to return */
  let table = { _features: features } as unknown as Table<TData>;

  const defaultOptions = table._features.reduce((obj, feature) => {
    return Object.assign(obj, feature.getDefaultOptions?.(table));
  }, {}) as TableOptionsResolved<TData>;

  const mergeOptions = (options: TableOptionsResolved<TData>) => {
    if (table.options.mergeOptions) {
      return table.options.mergeOptions(defaultOptions, options);
    }
    return {
      ...defaultOptions,
      ...options,
    };
  };

  const coreInitialState: CoreTableState = {};

  let initialState = {
    ...coreInitialState,
    ...(options.initialState ?? {}),
  } as TableState;
  table._features.forEach((feature) => {
    initialState = feature.getInitialState?.(initialState) ?? initialState;
  });

  /** task queue */
  const queued: (() => void)[] = [];
  let queuedTimeout = false;

  const coreInstance: CoreInstance<TData> = {
    _features: features,
    options: {
      ...defaultOptions,
      ...options,
    },
    initialState,
    _queue: (cb) => {
      queued.push(cb);

      if (!queuedTimeout) {
        queuedTimeout = true;

        // Schedule a microtask to run the queued callbacks after
        // the current call stack (render, etc) has finished.
        Promise.resolve()
          .then(() => {
            while (queued.length) {
              queued.shift()!();
            }
            queuedTimeout = false;
          })
          .catch((error) =>
            setTimeout(() => {
              throw error;
            }),
          );
      }
    },
    reset: () => {
      table.setState(table.initialState);
    },
    setOptions: (updater) => {
      const newOptions = functionalUpdate(updater, table.options);
      table.options = mergeOptions(newOptions) as RequiredKeys<
        TableOptionsResolved<TData>,
        'state'
      >;
    },

    getState: () => {
      return table.options.state as TableState;
    },

    setState: (updater: Updater<TableState>) => {
      table.options.onStateChange?.(updater);
    },

    _getRowId: (row: TData, index: number, parent?: Row<TData>) =>
      table.options.getRowId?.(row, index, parent) ??
      `${parent ? [parent.id, index].join('.') : index}`,

    getCoreRowModel: () => {
      if (!table._getCoreRowModel) {
        // 👇🏻 set default _getCoreRowModel
        table._getCoreRowModel = table.options.getCoreRowModel(table);
      }

      return table._getCoreRowModel!();
    },

    // The final calls start at the bottom of the model,
    // expanded rows, which then work their way up

    getRowModel: () => {
      return table.getPaginationRowModel();
    },
    getRow: (id: string) => {
      const row = table.getRowModel().rowsById[id];

      if (!row) {
        if (process.env.NODE_ENV !== 'production') {
          throw new Error(`getRow expected an ID, but got ${id}`);
        }
        throw new Error();
      }

      return row;
    },
    _getDefaultColumnDef: memo(
      () => [table.options.defaultColumn],
      (defaultColumn) => {
        defaultColumn = (defaultColumn ?? {}) as Partial<
          ColumnDef<TData, unknown>
        >;

        return {
          header: (props) => {
            const resolvedColumnDef = props.header.column
              .columnDef as ColumnDefResolved<TData>;

            if (resolvedColumnDef.accessorKey) {
              return resolvedColumnDef.accessorKey;
            }

            if (resolvedColumnDef.accessorFn) {
              return resolvedColumnDef.id;
            }

            return null;
          },
          // footer: props => props.header.column.id,
          cell: (props) => props.renderValue<any>()?.toString?.() ?? null,
          ...table._features.reduce((obj, feature) => {
            return Object.assign(obj, feature.getDefaultColumnDef?.());
          }, {}),
          ...defaultColumn,
        } as Partial<ColumnDef<TData, unknown>>;
      },
      {
        debug: () => table.options.debugAll ?? table.options.debugColumns,
        key: process.env.NODE_ENV === 'development' && 'getDefaultColumnDef',
      },
    ),

    _getColumnDefs: () => table.options.columns,

    getAllColumns: memo(
      () => [table._getColumnDefs()],
      (columnDefs) => {
        const recurseColumns = (
          columnDefs: ColumnDef<TData, unknown>[],
          parent?: Column<TData, unknown>,
          depth = 0,
        ): Column<TData, unknown>[] => {
          return columnDefs.map((columnDef) => {
            // 👇🏻
            const column = createColumn(table, columnDef, depth, parent);

            const groupingColumnDef = columnDef as GroupColumnDef<
              TData,
              unknown
            >;

            column.columns = groupingColumnDef.columns
              ? recurseColumns(groupingColumnDef.columns, column, depth + 1)
              : [];

            return column;
          });
        };

        return recurseColumns(columnDefs);
      },
      {
        key: process.env.NODE_ENV === 'development' && 'getAllColumns',
        debug: () => table.options.debugAll ?? table.options.debugColumns,
      },
    ),

    getAllFlatColumns: memo(
      () => [table.getAllColumns()],
      (allColumns) => {
        return allColumns.flatMap((column) => {
          return column.getFlatColumns();
        });
      },
      {
        key: process.env.NODE_ENV === 'development' && 'getAllFlatColumns',
        debug: () => table.options.debugAll ?? table.options.debugColumns,
      },
    ),

    _getAllFlatColumnsById: memo(
      () => [table.getAllFlatColumns()],
      (flatColumns) => {
        return flatColumns.reduce((acc, column) => {
          acc[column.id] = column;
          return acc;
        }, {} as Record<string, Column<TData, unknown>>);
      },
      {
        key: process.env.NODE_ENV === 'development' && 'getAllFlatColumnsById',
        debug: () => table.options.debugAll ?? table.options.debugColumns,
      },
    ),

    getAllLeafColumns: memo(
      () => [table.getAllColumns(), table._getOrderColumnsFn()],
      (allColumns, orderColumns) => {
        let leafColumns = allColumns.flatMap((column) =>
          column.getLeafColumns(),
        );
        return orderColumns(leafColumns);
      },
      {
        key: process.env.NODE_ENV === 'development' && 'getAllLeafColumns',
        debug: () => table.options.debugAll ?? table.options.debugColumns,
      },
    ),

    getColumn: (columnId) => {
      const column = table._getAllFlatColumnsById()[columnId];

      if (process.env.NODE_ENV !== 'production' && !column) {
        console.error(`[Table] Column with id '${columnId}' does not exist.`);
      }

      return column;
    },
  };

  Object.assign(table, coreInstance);

  table._features.forEach((feature) => {
    // 💡 take table, and return enhanced table; props with the same name will be overridden
    return Object.assign(table, feature.createTable?.(table));
  });

  return table;
}
