import type { CellContext, CoreCell } from './core/cell';
import type { CoreColumn } from './core/column';
import type {
  CoreHeader,
  CoreHeaderGroup,
  HeaderContext,
  HeadersInstance,
} from './core/headers';
import type { CoreRow } from './core/row';
import type { CoreInstance, CoreOptions, CoreTableState } from './core/table';
import type {
  ColumnSizingColumn,
  ColumnSizingColumnDef,
  ColumnSizingHeader,
  ColumnSizingInstance,
  ColumnSizingOptions,
  ColumnSizingTableState,
} from './features/ColumnSizing';
import type {
  ExpandedInstance,
  ExpandedOptions,
  ExpandedRow,
  ExpandedTableState,
} from './features/Expanding';
import type {
  FiltersColumn,
  FiltersColumnDef,
  FiltersInstance,
  FiltersOptions,
  FiltersRow,
  FiltersTableState,
} from './features/Filters';
import type {
  GroupingCell,
  GroupingColumn,
  GroupingColumnDef,
  GroupingInstance,
  GroupingOptions,
  GroupingRow,
  GroupingTableState,
} from './features/Grouping';
import type {
  ColumnOrderInstance,
  ColumnOrderOptions,
  ColumnOrderTableState,
} from './features/Ordering';
import type {
  PaginationInitialTableState,
  PaginationInstance,
  PaginationOptions,
  PaginationTableState,
} from './features/Pagination';
import type {
  ColumnPinningColumn,
  ColumnPinningColumnDef,
  ColumnPinningInstance,
  ColumnPinningOptions,
  ColumnPinningRow,
  ColumnPinningTableState,
} from './features/Pinning';
import type {
  RowSelectionInstance,
  RowSelectionOptions,
  RowSelectionRow,
  RowSelectionTableState,
} from './features/RowSelection';
import type {
  SortingColumn,
  SortingColumnDef,
  SortingInstance,
  SortingOptions,
  SortingTableState,
} from './features/Sorting';
import type {
  VisibilityColumn as ColumnVisibilityColumn,
  VisibilityColumnDef,
  VisibilityInstance,
  VisibilityOptions,
  VisibilityRow,
  VisibilityTableState,
} from './features/Visibility';
import type { PartialKeys, UnionToIntersection } from './utils';

export interface TableMeta<TData extends RowData> {}

export interface ColumnMeta<TData extends RowData, TValue> {}

export interface FilterMeta {}

export interface FilterFns {}

export interface SortingFns {}

export interface AggregationFns {}

export type Updater<T> = T | ((old: T) => T);
export type OnChangeFn<T> = (updaterOrValue: Updater<T>) => void;

export type RowData = unknown | object | any[];

export type AnyRender = (Comp: any, props: any) => any;

/**
 * The core table object containing both state and API
 */
export interface Table<TData extends RowData>
  extends CoreInstance<TData>,
    HeadersInstance<TData>,
    VisibilityInstance<TData>,
    ColumnOrderInstance<TData>,
    ColumnPinningInstance<TData>,
    FiltersInstance<TData>,
    SortingInstance<TData>,
    GroupingInstance<TData>,
    ColumnSizingInstance,
    ExpandedInstance<TData>,
    PaginationInstance<TData>,
    RowSelectionInstance<TData> {}

interface FeatureOptions<TData extends RowData>
  extends VisibilityOptions,
    ColumnOrderOptions,
    ColumnPinningOptions,
    FiltersOptions<TData>,
    SortingOptions<TData>,
    GroupingOptions,
    ExpandedOptions<TData>,
    ColumnSizingOptions,
    PaginationOptions,
    RowSelectionOptions<TData> {}

export type TableOptionsResolved<TData extends RowData> = CoreOptions<TData> &
  FeatureOptions<TData>;

export interface TableOptions<TData extends RowData>
  extends PartialKeys<
    TableOptionsResolved<TData>,
    'state' | 'onStateChange' | 'renderFallbackValue'
  > {}

/** default initial state is empty object {} */
export interface TableState
  extends CoreTableState,
    VisibilityTableState,
    ColumnOrderTableState,
    ColumnPinningTableState,
    FiltersTableState,
    SortingTableState,
    ExpandedTableState,
    GroupingTableState,
    ColumnSizingTableState,
    PaginationTableState,
    RowSelectionTableState {}

interface CompleteInitialTableState
  extends CoreTableState,
    VisibilityTableState,
    ColumnOrderTableState,
    ColumnPinningTableState,
    FiltersTableState,
    SortingTableState,
    ExpandedTableState,
    GroupingTableState,
    ColumnSizingTableState,
    PaginationInitialTableState,
    RowSelectionTableState {}

export interface InitialTableState extends Partial<CompleteInitialTableState> {}

/**
 * Each row mirrors its respective row data and provides row-specific APIs
 */
export interface Row<TData extends RowData>
  extends CoreRow<TData>,
    VisibilityRow<TData>,
    ColumnPinningRow<TData>,
    FiltersRow<TData>,
    GroupingRow,
    RowSelectionRow,
    ExpandedRow {}

/**
 * core data model for table data, rows/flatRows/rowsById
 */
export interface RowModel<TData extends RowData> {
  rows: Row<TData>[];
  flatRows: Row<TData>[];
  rowsById: Record<string, Row<TData>>;
}

export type AccessorFn<TData extends RowData, TValue = unknown> = (
  originalRow: TData,
  index: number,
) => TValue;

export type ColumnDefTemplate<TProps extends object> =
  | string
  | ((props: TProps) => any);

export type StringOrTemplateHeader<TData, TValue> =
  | string
  | ColumnDefTemplate<HeaderContext<TData, TValue>>;

interface StringHeaderIdentifier {
  header: string;
  id?: string;
}

interface IdIdentifier<TData extends RowData, TValue> {
  id: string;
  header?: StringOrTemplateHeader<TData, TValue>;
}

type ColumnIdentifiers<TData extends RowData, TValue> =
  | IdIdentifier<TData, TValue>
  | StringHeaderIdentifier;

//

interface ColumnDefExtensions<TData extends RowData, TValue = unknown>
  extends VisibilityColumnDef,
    ColumnPinningColumnDef,
    FiltersColumnDef<TData>,
    SortingColumnDef<TData>,
    GroupingColumnDef<TData, TValue>,
    ColumnSizingColumnDef {}

export interface ColumnDefBase<TData extends RowData, TValue = unknown>
  extends ColumnDefExtensions<TData, TValue> {
  getUniqueValues?: AccessorFn<TData, unknown[]>;
  /** The footer to display for the column.  */
  footer?: ColumnDefTemplate<HeaderContext<TData, TValue>>;
  /** The cell to display each row for the column.
   * - If a function is passed, it will be passed a props object for the cell and should return the rendered cell value
   */
  cell?: ColumnDefTemplate<CellContext<TData, TValue>>;
  /** metadata to associated with the column.
   * - We can access it anywhere when the column is available via `column.columnDef.meta`.
   * - This interface is extensible via declaration merging.
   */
  meta?: ColumnMeta<TData, TValue>;
}

//

export interface IdentifiedColumnDef<TData extends RowData, TValue = unknown>
  extends ColumnDefBase<TData, TValue> {
  /** A column ID is optional when:
   * - An accessor column is created with an object key accessor
   * - The column header is defined as a string
   */
  id?: string;
  /** The header to display for the column.
   * - If a string is passed, it can be used as a default for the column ID.
   */
  header?: StringOrTemplateHeader<TData, TValue>;
}

/** Display columns do not have a data model which means they cannot be sorted, filtered, etc,
 * but they can be used to display arbitrary content in the table, eg. a row actions button, checkbox */
export type DisplayColumnDef<
  TData extends RowData,
  TValue = unknown,
> = ColumnDefBase<TData, TValue> & ColumnIdentifiers<TData, TValue>;

interface GroupColumnDefBase<TData extends RowData, TValue = unknown>
  extends ColumnDefBase<TData, TValue> {
  /** The child column defs to include in a group column. */
  columns?: ColumnDef<TData, any>[];
}

/** Group columns do not have a data model so they too cannot be sorted, filtered, etc,
 * and are used to group other columns together. It's common to define a header or footer for a column group. */
export type GroupColumnDef<
  TData extends RowData,
  TValue = unknown,
> = GroupColumnDefBase<TData, TValue> & ColumnIdentifiers<TData, TValue>;

interface AccessorFnColumnDefBase<TData extends RowData, TValue = unknown>
  extends ColumnDefBase<TData, TValue> {
  /** accessor function to use when extracting the value for the column from each row. */
  accessorFn: AccessorFn<TData, TValue>;
  // accessorFn?: (originalRow: TData, index: number) => any
}

export type AccessorFnColumnDef<
  TData extends RowData,
  TValue = unknown,
> = AccessorFnColumnDefBase<TData, TValue> & ColumnIdentifiers<TData, TValue>;

interface AccessorKeyColumnDefBase<TData extends RowData, TValue = unknown>
  extends ColumnDefBase<TData, TValue> {
  /** A column ID is optional when:
   * - An accessor column is created with an object key accessor
   * - The column header is defined as a string
   */
  id?: string;
  /** The key of the row object to use when extracting the value for the column. */
  accessorKey: (string & {}) | keyof TData;
}

export type AccessorKeyColumnDef<
  TData extends RowData,
  TValue = unknown,
> = AccessorKeyColumnDefBase<TData, TValue> &
  Partial<ColumnIdentifiers<TData, TValue>>;

/** Accessor columns have an underlying data model which means they can be sorted, filtered, grouped, etc. */
export type AccessorColumnDef<TData extends RowData, TValue = unknown> =
  | AccessorKeyColumnDef<TData, TValue>
  | AccessorFnColumnDef<TData, TValue>;

//

/**
 * Column definitions are plain objects used to configure a column and its data model, display templates, and more
 * - Building the underlying data model that will be used for filter/sort/group
 * - Formatting the data model into what will be displayed
 * - Creating header groups, headers and footers
 * - Creating columns for display-only purposes, eg. action buttons, checkboxes, expanders, sparklines, etc.
 */
export type ColumnDef<TData extends RowData, TValue = unknown> =
  | DisplayColumnDef<TData, TValue>
  | GroupColumnDef<TData, TValue>
  | AccessorColumnDef<TData, TValue>;

export type ColumnDefResolved<
  TData extends RowData,
  TValue = unknown,
> = Partial<UnionToIntersection<ColumnDef<TData, TValue>>> & {
  /** The key of the row object to use when extracting the value for the column. */
  accessorKey?: string;
};

/**
 * Each column mirrors its respective column def and also provides column-specific APIs
 */
export interface Column<TData extends RowData, TValue = unknown>
  extends CoreColumn<TData, TValue>,
    ColumnVisibilityColumn,
    ColumnPinningColumn,
    FiltersColumn<TData>,
    SortingColumn<TData>,
    GroupingColumn<TData>,
    ColumnSizingColumn {}

/**
 * Each cell mirrors its respective row-column intersection and provides cell-specific APIs
 */
export interface Cell<TData extends RowData, TValue>
  extends CoreCell<TData, TValue>,
    GroupingCell {}

/**
 * Each header is either directly associated with or derived from its column def and provides header-specific APIs
 */
export interface Header<TData extends RowData, TValue>
  extends CoreHeader<TData, TValue>,
    ColumnSizingHeader {}

/**
 * Header groups are computed slices of nested header levels, each containing a group of headers
 */
export interface HeaderGroup<TData extends RowData>
  extends CoreHeaderGroup<TData> {}
