import { ExceptionBase } from '@datalking/pivot-entity';

export class InvalidUserIdError extends ExceptionBase {
  code = 'USER.INVALID_ID';

  constructor() {
    super('invalid user id');
  }
}
