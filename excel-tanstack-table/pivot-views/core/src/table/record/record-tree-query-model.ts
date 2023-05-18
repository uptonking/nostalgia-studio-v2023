import type { TreeField } from '../field/index';
import type { IQueryTreeRecords } from './record.type';
import type { IRecordSpec } from './specifications/index';

export interface IRecordTreeQueryModel {
  findTrees(
    tableId: string,
    field: TreeField,
    spec: IRecordSpec,
  ): Promise<IQueryTreeRecords>;
}
