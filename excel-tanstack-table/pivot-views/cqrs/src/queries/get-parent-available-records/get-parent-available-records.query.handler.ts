import { Option } from 'oxide.ts';

import {
  type IRecordQueryModel,
  type ITableRepository,
  ParentAvailableSpec,
  ViewId,
  WithRecordTableId,
} from '@datalking/pivot-core';
import { type IQueryHandler } from '@datalking/pivot-entity';
import { andOptions } from '@datalking/pivot-entity';

import { type IGetParentAvailableRecordsOutput } from './get-parent-available-records.query.interface';
import { type GetParentAvailableRecordsQuery } from './get-parent-available-records.query';

export class GetParentAvailableRecordsQueryHandler
  implements
    IQueryHandler<
      GetParentAvailableRecordsQuery,
      IGetParentAvailableRecordsOutput
    >
{
  constructor(
    protected readonly tableRepo: ITableRepository,
    protected readonly rm: IRecordQueryModel,
  ) {}

  async execute(
    query: GetParentAvailableRecordsQuery,
  ): Promise<IGetParentAvailableRecordsOutput> {
    const table = (await this.tableRepo.findOneById(query.tableId)).unwrap();
    const spec = andOptions(
      table.getSpec(query.viewId),
      Option(WithRecordTableId.fromString(query.tableId).unwrap()),
      Option(new ParentAvailableSpec(query.parentFieldId, query.recordId)),
    ).unwrap();

    const viewId = query.viewId ? ViewId.fromString(query.viewId) : undefined;
    const records = await this.rm.find(table.id.value, viewId, spec);

    return { records };
  }
}
