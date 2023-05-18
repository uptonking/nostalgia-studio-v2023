import type { Option } from 'oxide.ts';
import type { ViewId } from '../view/index';
import type { IQueryRecords, IQueryRecordSchema } from './record.type';
import type { IRecordSpec } from './specifications/index';

export interface IRecordQueryModel {
  findOne(
    tableId: string,
    spec: IRecordSpec,
  ): Promise<Option<IQueryRecordSchema>>;
  findOneById(tableId: string, id: string): Promise<Option<IQueryRecordSchema>>;
  find(
    tableId: string,
    viewId: ViewId | undefined,
    spec: IRecordSpec | null,
  ): Promise<IQueryRecords>;
  findAndCount(
    tableId: string,
    viewId: ViewId | undefined,
    spec: IRecordSpec | null,
  ): Promise<{ records: IQueryRecords; total: number }>;
}
