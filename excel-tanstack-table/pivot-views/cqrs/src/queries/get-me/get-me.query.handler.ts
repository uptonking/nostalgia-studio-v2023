import { IUserQueryModel } from '@datalking/pivot-core';
import type { IQueryHandler } from '@datalking/pivot-entity';

import type { IGetMeOutput } from './get-me.query.interface.js';
import type { GetMeQuery } from './get-me.query.js';

export class GetMeQueryHandler
  implements IQueryHandler<GetMeQuery, IGetMeOutput>
{
  constructor(protected readonly rm: IUserQueryModel) {}
  async execute(query: GetMeQuery): Promise<IGetMeOutput> {
    const user = (await this.rm.findOneById(query.me.userId)).into();
    if (!user) throw new Error('not found me');

    return {
      me: user,
    };
  }
}
