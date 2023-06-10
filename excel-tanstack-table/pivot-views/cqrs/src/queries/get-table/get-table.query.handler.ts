import { type ITableQueryModel } from '@datalking/pivot-core';
import { type IQueryHandler } from '@datalking/pivot-entity';

import { type GetTableQuery } from './get-table.query';
import { type IGetTableOutput } from './get-table.query.interface';

export class GetTableQueryHandler
  implements IQueryHandler<GetTableQuery, IGetTableOutput>
{
  constructor(protected readonly rm: ITableQueryModel) {}

  async execute(query: GetTableQuery): Promise<IGetTableOutput> {
    const table = (await this.rm.findOneById(query.id)).into();

    if (!table) {
      return undefined;
    }

    return table;
  }
}
