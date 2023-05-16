import type { ITableRepository } from '@datalking/pivot-core';
import type { ICommandHandler } from '@datalking/pivot-entity';

import type { SetFieldVisibilityCommand } from './set-field-visibility.command.js';

export class SetFieldVisibilityCommandHandler
  implements ICommandHandler<SetFieldVisibilityCommand, void>
{
  constructor(protected readonly tableRepo: ITableRepository) {}

  async execute(command: SetFieldVisibilityCommand): Promise<void> {
    const table = (await this.tableRepo.findOneById(command.tableId)).unwrap();

    const spec = table.setFieldVisibility(command);

    await this.tableRepo.updateOneById(table.id.value, spec);
  }
}
