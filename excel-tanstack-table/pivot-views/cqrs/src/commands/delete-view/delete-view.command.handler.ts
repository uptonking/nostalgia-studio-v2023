import { type ITableRepository } from '@datalking/pivot-core';
import type { ICommandHandler } from '@datalking/pivot-entity';

import type { DeleteViewCommand } from './delete-view.comand';

export class DeleteViewCommandHandler
  implements ICommandHandler<DeleteViewCommand, void>
{
  constructor(protected readonly tableRepo: ITableRepository) {}

  async execute(command: DeleteViewCommand): Promise<void> {
    const table = (await this.tableRepo.findOneById(command.tableId)).unwrap();

    const spec = table.removeView(command.id);

    await this.tableRepo.updateOneById(table.id.value, spec);
  }
}
