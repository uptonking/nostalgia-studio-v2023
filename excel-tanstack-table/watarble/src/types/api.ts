import { type ColumnDef, type RowData } from '@tanstack/table-core';

export type WatarbleOptions<TData extends RowData = RowData> = {
  container?: HTMLElement | 'string';
  data?: TData[];
  columns?: ColumnDef<TData, any>[];
};
