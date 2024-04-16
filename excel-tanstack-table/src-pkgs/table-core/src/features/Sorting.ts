import { type RowModel } from '..';
import { type TableFeature } from '../core/table';
import {
  type BuiltInSortingFn,
  reSplitAlphaNumeric,
  sortingFns,
} from '../sortingFns';
import {
  type Column,
  type OnChangeFn,
  type Row,
  type RowData,
  type SortingFns,
  type Table,
  type Updater,
} from '../types';
import { isFunction, makeStateUpdater } from '../utils';

export type SortDirection = 'asc' | 'desc';

export interface ColumnSort {
  id: string;
  desc: boolean;
}

export type SortingState = ColumnSort[];

export interface SortingTableState {
  sorting: SortingState;
}

export interface SortingFn<TData extends RowData> {
  (rowA: Row<TData>, rowB: Row<TData>, columnId: string): number;
}

export type CustomSortingFns<TData extends RowData> = Record<
  string,
  SortingFn<TData>
>;

export type SortingFnOption<TData extends RowData> =
  | 'auto'
  | keyof SortingFns
  | BuiltInSortingFn
  | SortingFn<TData>;

export interface SortingColumnDef<TData extends RowData> {
  sortingFn?: SortingFnOption<TData>;
  /** Set to true for sorting toggles on this column to start in the descending direction. */
  sortDescFirst?: boolean;
  enableSorting?: boolean;
  /** enabled by default.
   * - To multi-sort the table via UI, hold `shift` while clicking on any header
   */
  enableMultiSort?: boolean;
  invertSorting?: boolean;
  /**
   * - false: Undefined values will be considered tied and need to be sorted by the next colum filter or original index (which ever applies)
   * - -1: Undefined values will be sorted with higher priority (ascending)
   * -  1: Undefined values will be sorted with lower priority (descending)
   */
  sortUndefined?: false | -1 | 1;
}

export interface SortingColumn<TData extends RowData> {
  getAutoSortingFn: () => SortingFn<TData>;
  getAutoSortDir: () => SortDirection;
  getSortingFn: () => SortingFn<TData>;
  getFirstSortDir: () => SortDirection;
  /** Returns the next sorting order that after click and before render.
   * - sort order is: `asc` > `desc` > false
   */
  getNextSortingOrder: () => SortDirection | false;
  getCanSort: () => boolean;
  getCanMultiSort: () => boolean;
  getSortIndex: () => number;
  getIsSorted: () => false | SortDirection;
  clearSorting: () => void;
  /** Toggles this columns sorting state. If desc is provided, it will force the sort direction to that value.  */
  toggleSorting: (desc?: boolean, isMulti?: boolean) => void;
  /** Returns a function that can be used to toggle this column's sorting state.
   * - This is useful for attaching a click handler to the column header.
   * - for text column, toggle order is: `asc` > `desc` > false
   * - for number column, toggle order is: `desc` > `asc` > false
   */
  getToggleSortingHandler: () => undefined | ((event: unknown) => void);
}

interface SortingOptionsBase {
  /** If true, you will be expected to sort your data before it is passed to the table.
   * - This is useful if you are doing server-side sorting. */
  manualSorting?: boolean;
  /** If provided, this function will be called with an updaterFn when state.sorting changes. */
  onSortingChange?: OnChangeFn<SortingState>;
  enableSorting?: boolean;
  /** Enables/Disables the ability to remove sorting for the table.
   * - If `true` then changing sort order will circle like: 'none' -> 'desc' -> 'asc' -> 'none'
   * - If `false` then changing sort order will circle like: 'none' -> 'desc' -> 'asc' -> 'desc' -> 'asc'
   */
  enableSortingRemoval?: boolean;
  enableMultiRemove?: boolean;
  enableMultiSort?: boolean;
  /** If true, all sorts will default to descending as their first toggle state. */
  sortDescFirst?: boolean;
  getSortedRowModel?: (table: Table<any>) => () => RowModel<any>;
  maxMultiSortColCount?: number;
  /** Pass a custom function that will be used to determine if a multi-sort event should be triggered.
   * - It is passed the event from the sort toggle handler and should return true if the event should trigger a multi-sort. */
  isMultiSortEvent?: (e: unknown) => boolean;
}

type ResolvedSortingFns = keyof SortingFns extends never
  ? {
      sortingFns?: Record<string, SortingFn<any>>;
    }
  : {
      sortingFns: Record<keyof SortingFns, SortingFn<any>>;
    };

export interface SortingOptions<TData extends RowData>
  extends SortingOptionsBase,
    ResolvedSortingFns {}

export interface SortingInstance<TData extends RowData> {
  setSorting: (updater: Updater<SortingState>) => void;
  resetSorting: (defaultState?: boolean) => void;
  getPreSortedRowModel: () => RowModel<TData>;
  getSortedRowModel: () => RowModel<TData>;
  _getSortedRowModel?: () => RowModel<TData>;
}

//

export const Sorting: TableFeature = {
  getInitialState: (state): SortingTableState => {
    return {
      sorting: [],
      ...state,
    };
  },

  getDefaultColumnDef: <TData extends RowData>(): SortingColumnDef<TData> => {
    return {
      sortingFn: 'auto',
    };
  },

  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>,
  ): SortingOptions<TData> => {
    return {
      onSortingChange: makeStateUpdater('sorting', table),
      isMultiSortEvent: (e: unknown) => {
        return (e as MouseEvent).shiftKey;
      },
    };
  },

  createColumn: <TData extends RowData, TValue>(
    column: Column<TData, TValue>,
    table: Table<TData>,
  ): SortingColumn<TData> => {
    return {
      getAutoSortingFn: () => {
        const firstRows = table.getFilteredRowModel().flatRows.slice(10);

        let isString = false;

        for (const row of firstRows) {
          const value = row?.getValue(column.id);

          if (Object.prototype.toString.call(value) === '[object Date]') {
            return sortingFns.datetime;
          }

          if (typeof value === 'string') {
            isString = true;

            if (value.split(reSplitAlphaNumeric).length > 1) {
              return sortingFns.alphanumeric;
            }
          }
        }

        if (isString) {
          return sortingFns.text;
        }

        return sortingFns.basic;
      },
      getAutoSortDir: () => {
        const firstRow = table.getFilteredRowModel().flatRows[0];

        const value = firstRow?.getValue(column.id);

        if (typeof value === 'string') {
          return 'asc';
        }

        return 'desc';
      },
      getSortingFn: () => {
        if (!column) {
          throw new Error();
        }

        return isFunction(column.columnDef.sortingFn)
          ? column.columnDef.sortingFn
          : column.columnDef.sortingFn === 'auto'
            ? column.getAutoSortingFn()
            : table.options.sortingFns?.[
                column.columnDef.sortingFn as string
              ] ?? sortingFns[column.columnDef.sortingFn as BuiltInSortingFn];
      },
      toggleSorting: (desc, multi) => {
        // if (column.columns.length) {
        //   column.columns.forEach((c, i) => {
        //     if (c.id) {
        //       table.toggleColumnSorting(c.id, undefined, multi || !!i)
        //     }
        //   })
        //   return
        // }

        // this needs to be outside of table.setSorting to be in sync with rerender
        const nextSortingOrder = column.getNextSortingOrder();
        const hasManualValue = typeof desc !== 'undefined' && desc !== null;

        table.setSorting((old) => {
          // console.log(';; toggleSorting-setSorting ');
          // Find any existing sorting for this column
          const existingSorting = old?.find((d) => d.id === column.id);
          const existingIndex = old?.findIndex((d) => d.id === column.id);

          let newSorting: SortingState = [];

          // What should we do with this sort action?
          let sortAction: 'add' | 'remove' | 'toggle' | 'replace';
          const nextDesc = hasManualValue ? desc : nextSortingOrder === 'desc';

          // Multi-mode
          if (old?.length && column.getCanMultiSort() && multi) {
            if (existingSorting) {
              sortAction = 'toggle';
            } else {
              sortAction = 'add';
            }
          } else {
            // Normal mode
            if (old?.length && existingIndex !== old.length - 1) {
              sortAction = 'replace';
            } else if (existingSorting) {
              sortAction = 'toggle';
            } else {
              sortAction = 'replace';
            }
          }

          // Handle toggle states that will remove the sorting
          if (sortAction === 'toggle') {
            // If we are "actually" toggling (not a manual set value), should we remove the sorting?
            if (!hasManualValue) {
              // Is our intention to remove?
              if (!nextSortingOrder) {
                sortAction = 'remove';
              }
            }
          }

          if (sortAction === 'add') {
            newSorting = [
              ...old,
              {
                id: column.id,
                desc: nextDesc,
              },
            ];
            // Take latest n columns
            newSorting.splice(
              0,
              newSorting.length -
                (table.options.maxMultiSortColCount ?? Number.MAX_SAFE_INTEGER),
            );
          } else if (sortAction === 'toggle') {
            // This flips (or sets) the
            newSorting = old.map((d) => {
              if (d.id === column.id) {
                return {
                  ...d,
                  desc: nextDesc,
                };
              }
              return d;
            });
          } else if (sortAction === 'remove') {
            newSorting = old.filter((d) => d.id !== column.id);
          } else {
            newSorting = [
              {
                id: column.id,
                desc: nextDesc,
              },
            ];
          }

          return newSorting;
        });
      },

      getFirstSortDir: () => {
        const sortDescFirst =
          column.columnDef.sortDescFirst ??
          table.options.sortDescFirst ??
          column.getAutoSortDir() === 'desc';
        return sortDescFirst ? 'desc' : 'asc';
      },

      getNextSortingOrder: (multi?: boolean) => {
        const firstSortDirection = column.getFirstSortDir();
        const isSorted = column.getIsSorted();

        if (!isSorted) {
          return firstSortDirection;
        }

        if (
          isSorted !== firstSortDirection &&
          (table.options.enableSortingRemoval ?? true) && // If enableSortRemove, enable in general
          (multi ? table.options.enableMultiRemove ?? true : true) // If multi, don't allow if enableMultiRemove))
        ) {
          return false;
        }
        return isSorted === 'desc' ? 'asc' : 'desc';
      },

      getCanSort: () => {
        return (
          (column.columnDef.enableSorting ?? true) &&
          (table.options.enableSorting ?? true) &&
          Boolean(column.accessorFn)
        );
      },

      getCanMultiSort: () => {
        return (
          column.columnDef.enableMultiSort ??
          table.options.enableMultiSort ??
          Boolean(column.accessorFn)
        );
      },

      getIsSorted: () => {
        const columnSort = table
          .getState()
          .sorting?.find((d) => d.id === column.id);

        return !columnSort ? false : columnSort.desc ? 'desc' : 'asc';
      },

      getSortIndex: () =>
        table.getState().sorting?.findIndex((d) => d.id === column.id) ?? -1,

      clearSorting: () => {
        //clear sorting for just 1 column
        table.setSorting((old) =>
          old?.length ? old.filter((d) => d.id !== column.id) : [],
        );
      },

      getToggleSortingHandler: () => {
        const canSort = column.getCanSort();

        return (e: unknown) => {
          if (!canSort) return;
          // As of v17, e.persist() doesn’t do anything because the SyntheticEvent is no longer pooled.
          (e as any).persist?.();
          column.toggleSorting?.(
            undefined,
            column.getCanMultiSort()
              ? table.options.isMultiSortEvent?.(e)
              : false,
          );
        };
      },
    };
  },

  createTable: <TData extends RowData>(
    table: Table<TData>,
  ): SortingInstance<TData> => {
    return {
      setSorting: (updater) => {
        // console.log(
        //   ';; onSortingChange1 ',
        //   typeof table.options.onSortingChange,
        //   table.options.onSortingChange,
        //   typeof updater,
        //   table.getState().sorting,
        // );
        const ret = table.options.onSortingChange?.(updater);
        // console.log(';; onSortingChange2 ', table.getState().sorting, ret);
        return ret;
      },
      resetSorting: (defaultState) => {
        table.setSorting(defaultState ? [] : table.initialState?.sorting ?? []);
      },
      getPreSortedRowModel: () => table.getGroupedRowModel(),
      getSortedRowModel: () => {
        if (!table._getSortedRowModel && table.options.getSortedRowModel) {
          table._getSortedRowModel = table.options.getSortedRowModel(table);
        }

        if (table.options.manualSorting || !table._getSortedRowModel) {
          return table.getPreSortedRowModel();
        }

        return table._getSortedRowModel();
      },
    };
  },
};
