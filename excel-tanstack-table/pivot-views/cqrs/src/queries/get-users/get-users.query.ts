import { Query } from '@datalking/pivot-entity';

import { type IGetUsersQuery } from './get-users.query.interface';

export class GetUsersQuery extends Query implements IGetUsersQuery {}
