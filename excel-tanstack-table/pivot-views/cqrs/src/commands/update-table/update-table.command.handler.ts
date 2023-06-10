import { type ITableRepository } from '@datalking/pivot-core';
import { type ICommandHandler } from '@datalking/pivot-entity';

import { type UpdateTableCommand } from './update-table.command';

type IUpdateTableCommandHandler = ICommandHandler<UpdateTableCommand, void>;

export class UpdateTableCommandHandler implements IUpdateTableCommandHandler {
  constructor(protected readonly tableRepo: ITableRepository) {}

  async execute(command: UpdateTableCommand): Promise<void> {
    const table = (await this.tableRepo.findOneById(command.id)).unwrap();

    const spec = table.update(command);

    if (spec.isSome()) {
      await this.tableRepo.updateOneById(table.id.value, spec.unwrap());
    }
  }
}
