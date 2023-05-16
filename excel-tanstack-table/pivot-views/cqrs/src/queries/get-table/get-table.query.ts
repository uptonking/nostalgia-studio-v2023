import { Query } from '@datalking/pivot-entity';

import type { IGetTableQuery } from './get-table.query.interface.js';

export class GetTableQuery extends Query {
  public readonly id: string;

  constructor(query: IGetTableQuery) {
    super();
    this.id = query.id;
  }
}
