import { type RecordAllValues, type Records } from '@datalking/pivot-core';
import {
  type Column,
  type Header,
  type HeaderGroup,
  type Row,
} from '@tanstack/react-table';

export type TData = RecordAllValues;

export type THeaderGroup = HeaderGroup<TData>;
export type THeader = Header<TData, unknown>;
export type TColumn = Column<TData, unknown>;

export type TRow = Row<TData>;

export interface IProps {
  /** array of table record object  */
  records: Records;
}
