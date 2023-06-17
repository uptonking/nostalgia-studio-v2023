import { type ColumnDef, type RowData } from '@tanstack/table-core';

/**
 * most top level options are for table view if not explained.
 */
export type WatarbleParams<TData extends RowData = RowData> = {
  id?: string;
  container?: HTMLElement | string;
  data?: TData[];
  columns?: ColumnDef<TData, any>[];
  onChange?: (data: TData) => void;
};
