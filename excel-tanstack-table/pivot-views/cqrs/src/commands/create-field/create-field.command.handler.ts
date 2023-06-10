import {
  type ITableRepository,
  type ITableSpecHandler,
} from '@datalking/pivot-core';
import { type ICommandHandler } from '@datalking/pivot-entity';

import { type CreateFieldCommand } from './create-field.command';

type ICreateFieldCommandHandler = ICommandHandler<CreateFieldCommand, void>;

export class CreateFieldCommandHandler implements ICreateFieldCommandHandler {
  constructor(
    protected readonly tableRepo: ITableRepository,
    protected readonly handler: ITableSpecHandler,
  ) {}

  async execute(command: CreateFieldCommand): Promise<void> {
    const table = (await this.tableRepo.findOneById(command.tableId)).unwrap();
    const spec = table.createField(command.viewId, command.field, command.at);

    await this.tableRepo.updateOneById(table.id.value, spec);

    await this.handler.handle(table, spec);
  }
}
