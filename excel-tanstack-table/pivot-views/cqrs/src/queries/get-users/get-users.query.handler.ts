import { IUserQueryModel } from '@datalking/pivot-core';
import type { IQueryHandler } from '@datalking/pivot-entity';

import type { IGetUsersOutput } from './get-users.query.interface.js';
import type { GetUsersQuery } from './get-users.query.js';

export class GetUsersQueryHandler
  implements IQueryHandler<GetUsersQuery, IGetUsersOutput>
{
  constructor(protected readonly rm: IUserQueryModel) {}
  async execute(query: GetUsersQuery): Promise<IGetUsersOutput> {
    const users = await this.rm.find();

    return {
      users,
    };
  }
}
