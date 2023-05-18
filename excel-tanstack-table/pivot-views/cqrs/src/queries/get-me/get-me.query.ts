import { IQueryUser } from '@datalking/pivot-core';
import { Query } from '@datalking/pivot-entity';

import type { IGetMeQuery } from './get-me.query.interface';

export class GetMeQuery extends Query implements IGetMeQuery {
  public readonly me: IQueryUser;

  constructor(query: IGetMeQuery) {
    super();
    this.me = query.me;
  }
}
