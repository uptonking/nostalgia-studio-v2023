import type { ITableRepository } from '@datalking/pivot-core';
import type { ICommandHandler } from '@datalking/pivot-entity';

import type { SetFieldWidthCommand } from './set-field-width.command';

export class SetFieldWidthCommandHandler
  implements ICommandHandler<SetFieldWidthCommand, void>
{
  constructor(protected readonly tableRepo: ITableRepository) {}

  async execute(command: SetFieldWidthCommand): Promise<void> {
    const table = (await this.tableRepo.findOneById(command.tableId)).unwrap();

    const spec = table.setFieldWidth(command);

    await this.tableRepo.updateOneById(table.id.value, spec);
  }
}
