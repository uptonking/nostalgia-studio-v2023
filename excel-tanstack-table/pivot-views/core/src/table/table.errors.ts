import { ExceptionBase } from '@datalking/pivot-entity';

export class InvalidTableIdError extends ExceptionBase {
  code = 'TABLE.INVALID_ID';

  constructor() {
    super('invalid table id');
  }
}
