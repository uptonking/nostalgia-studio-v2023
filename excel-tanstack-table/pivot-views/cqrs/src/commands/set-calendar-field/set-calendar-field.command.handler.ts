import { type ITableRepository } from '@datalking/pivot-core';
import { type ICommandHandler } from '@datalking/pivot-entity';

import { type SetCalendarFieldCommand } from './set-calendar-field.command';

type ISetCalendarFieldCommandHandler = ICommandHandler<
  SetCalendarFieldCommand,
  void
>;

export class SetCalendarFieldCommandHandler
  implements ISetCalendarFieldCommandHandler
{
  constructor(protected readonly repo: ITableRepository) {}

  async execute(command: SetCalendarFieldCommand): Promise<void> {
    const table = (await this.repo.findOneById(command.tableId)).unwrap();

    const spec = table.setCalendarField(command);

    await this.repo.updateOneById(table.id.value, spec);
  }
}
