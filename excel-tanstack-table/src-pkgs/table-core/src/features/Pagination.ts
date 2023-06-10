import { type TableFeature } from '../core/table';
import {
  type OnChangeFn,
  type RowData,
  type RowModel,
  type Table,
  type Updater,
} from '../types';
import { functionalUpdate, makeStateUpdater, memo } from '../utils';

export interface PaginationState {
  pageIndex: number;
  pageSize: number;
}

export interface PaginationTableState {
  pagination: PaginationState;
}

export interface PaginationInitialTableState {
  pagination?: Partial<PaginationState>;
}

export interface PaginationOptions {
  /** When manually controlling pagination, you should supply a total pageCount value to the table if you know it. If you do not know how many pages there are, you can set this to -1. */
  pageCount?: number;
  /** Enables manual pagination.
   * - If `true`, the table will not automatically paginate rows using `getPaginationRowModel()` and instead will expect you to manually paginate the rows before passing them to the table.
   * - This is useful if you are doing server-side pagination and aggregation.
   */
  manualPagination?: boolean;
  onPaginationChange?: OnChangeFn<PaginationState>;
  /** If true, pagination will be reset to the first page when page-altering state changes eg. data is updated, filters change, grouping changes, etc.
   * - This option defaults to false if `manualPagination` is set to true
   */
  autoResetPageIndex?: boolean;
  /** Returns the row model after pagination has taken place, but no further.
   * - Pagination columns are automatically reordered by default to the start of the columns list.
   * - If you would rather remove them or leave them as-is, set the appropriate mode here.
   */
  getPaginationRowModel?: (table: Table<any>) => () => RowModel<any>;
}

export interface PaginationDefaultOptions {
  onPaginationChange: OnChangeFn<PaginationState>;
}

export interface PaginationInstance<TData extends RowData> {
  _autoResetPageIndex: () => void;
  setPagination: (updater: Updater<PaginationState>) => void;
  resetPagination: (defaultState?: boolean) => void;
  setPageIndex: (updater: Updater<number>) => void;
  resetPageIndex: (defaultState?: boolean) => void;
  setPageSize: (updater: Updater<number>) => void;
  resetPageSize: (defaultState?: boolean) => void;
  setPageCount: (updater: Updater<number>) => void;
  getPageOptions: () => number[];
  getCanPreviousPage: () => boolean;
  getCanNextPage: () => boolean;
  previousPage: () => void;
  nextPage: () => void;
  /** Returns the row model for the table before any pagination has been applied. */
  getPrePaginationRowModel: () => RowModel<TData>;
  /** Returns the row model for the table after pagination has been applied. */
  getPaginationRowModel: () => RowModel<TData>;
  _getPaginationRowModel?: () => RowModel<TData>;
  getPageCount: () => number;
}

//

const defaultPageIndex = 0;
const defaultPageSize = 10;

const getDefaultPaginationState = (): PaginationState => ({
  pageIndex: defaultPageIndex,
  pageSize: defaultPageSize,
});

export const Pagination: TableFeature = {
  getInitialState: (state): PaginationTableState => {
    return {
      ...state,
      pagination: {
        ...getDefaultPaginationState(),
        ...state?.pagination,
      },
    };
  },

  getDefaultOptions: <TData extends RowData>(
    table: Table<TData>,
  ): PaginationDefaultOptions => {
    return {
      onPaginationChange: makeStateUpdater('pagination', table),
    };
  },

  createTable: <TData extends RowData>(
    table: Table<TData>,
  ): PaginationInstance<TData> => {
    let registered = false;
    let queued = false;

    return {
      _autoResetPageIndex: () => {
        if (!registered) {
          table._queue(() => {
            registered = true;
          });
          return;
        }

        if (
          table.options.autoResetAll ??
          table.options.autoResetPageIndex ??
          !table.options.manualPagination
        ) {
          if (queued) return;
          queued = true;
          table._queue(() => {
            table.resetPageIndex();
            queued = false;
          });
        }
      },
      setPagination: (updater) => {
        const safeUpdater: Updater<PaginationState> = (old) => {
          let newState = functionalUpdate(updater, old);

          return newState;
        };

        return table.options.onPaginationChange?.(safeUpdater);
      },
      resetPagination: (defaultState) => {
        table.setPagination(
          defaultState
            ? getDefaultPaginationState()
            : table.initialState.pagination ?? getDefaultPaginationState(),
        );
      },
      setPageIndex: (updater) => {
        table.setPagination((old) => {
          let pageIndex = functionalUpdate(updater, old.pageIndex);

          const maxPageIndex =
            typeof table.options.pageCount === 'undefined' ||
            table.options.pageCount === -1
              ? Number.MAX_SAFE_INTEGER
              : table.options.pageCount - 1;

          pageIndex = Math.max(0, Math.min(pageIndex, maxPageIndex));

          return {
            ...old,
            pageIndex,
          };
        });
      },
      resetPageIndex: (defaultState) => {
        table.setPageIndex(
          defaultState
            ? defaultPageIndex
            : table.initialState?.pagination?.pageIndex ?? defaultPageIndex,
        );
      },
      resetPageSize: (defaultState) => {
        table.setPageSize(
          defaultState
            ? defaultPageSize
            : table.initialState?.pagination?.pageSize ?? defaultPageSize,
        );
      },
      setPageSize: (updater) => {
        table.setPagination((old) => {
          const pageSize = Math.max(1, functionalUpdate(updater, old.pageSize));
          const topRowIndex = old.pageSize * old.pageIndex!;
          const pageIndex = Math.floor(topRowIndex / pageSize);

          return {
            ...old,
            pageIndex,
            pageSize,
          };
        });
      },
      setPageCount: (updater) =>
        table.setPagination((old) => {
          let newPageCount = functionalUpdate(
            updater,
            table.options.pageCount ?? -1,
          );

          if (typeof newPageCount === 'number') {
            newPageCount = Math.max(-1, newPageCount);
          }

          return {
            ...old,
            pageCount: newPageCount,
          };
        }),

      getPageOptions: memo(
        () => [table.getPageCount()],
        (pageCount) => {
          let pageOptions: number[] = [];
          if (pageCount && pageCount > 0) {
            pageOptions = [...new Array(pageCount)].fill(null).map((_, i) => i);
          }
          return pageOptions;
        },
        {
          key: process.env.NODE_ENV === 'development' && 'getPageOptions',
          debug: () => table.options.debugAll ?? table.options.debugTable,
        },
      ),

      getCanPreviousPage: () => table.getState().pagination.pageIndex > 0,

      getCanNextPage: () => {
        const { pageIndex } = table.getState().pagination;

        const pageCount = table.getPageCount();

        if (pageCount === -1) {
          return true;
        }

        if (pageCount === 0) {
          return false;
        }

        return pageIndex < pageCount - 1;
      },

      previousPage: () => {
        return table.setPageIndex((old) => old - 1);
      },

      nextPage: () => {
        return table.setPageIndex((old) => {
          return old + 1;
        });
      },

      getPrePaginationRowModel: () => table.getExpandedRowModel(),

      getPaginationRowModel: () => {
        if (
          !table._getPaginationRowModel &&
          table.options.getPaginationRowModel
        ) {
          table._getPaginationRowModel =
            table.options.getPaginationRowModel(table);
        }

        if (table.options.manualPagination || !table._getPaginationRowModel) {
          return table.getPrePaginationRowModel();
        }

        return table._getPaginationRowModel();
      },

      getPageCount: () => {
        return (
          table.options.pageCount ??
          Math.ceil(
            table.getPrePaginationRowModel().rows.length /
              table.getState().pagination.pageSize,
          )
        );
      },
    };
  },
};
