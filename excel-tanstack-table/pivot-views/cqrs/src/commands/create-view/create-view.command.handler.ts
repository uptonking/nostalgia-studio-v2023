import { type ITableRepository } from '@datalking/pivot-core';
import type { ICommandHandler } from '@datalking/pivot-entity';

import type { CreateViewCommand } from './create-view.command.js';

type ICreateViewCommandHandler = ICommandHandler<CreateViewCommand, void>;

export class CreateViewCommandHandler implements ICreateViewCommandHandler {
  constructor(protected readonly tableRepo: ITableRepository) {}

  async execute(command: CreateViewCommand): Promise<void> {
    const table = (await this.tableRepo.findOneById(command.tableId)).unwrap();

    const spec = table.createView(command.view);

    await this.tableRepo.updateOneById(table.id.value, spec);
  }
}
