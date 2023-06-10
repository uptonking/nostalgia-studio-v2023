import {
  type IRecordQueryModel,
  type ITableRepository,
} from '@datalking/pivot-core';
import { type IQueryHandler } from '@datalking/pivot-entity';

import { type GetRecordQuery } from './get-record.query';
import { type IGetRecordOutput } from './get-record.query.interface';

export class GetRecordQueryHandler
  implements IQueryHandler<GetRecordQuery, IGetRecordOutput>
{
  constructor(
    protected readonly tableRepo: ITableRepository,
    protected readonly rm: IRecordQueryModel,
  ) {}

  async execute(query: GetRecordQuery): Promise<IGetRecordOutput> {
    const record = (await this.rm.findOneById(query.tableId, query.id)).into();

    return record;
  }
}
