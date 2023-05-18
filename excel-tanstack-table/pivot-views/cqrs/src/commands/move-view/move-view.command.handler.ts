import type { ITableRepository } from '@datalking/pivot-core';
import type { ICommandHandler } from '@datalking/pivot-entity';

import type { MoveViewCommand } from './move-view.command';

type IMoveViewCommandHandler = ICommandHandler<MoveViewCommand, void>;

export class MoveViewCommandHandler implements IMoveViewCommandHandler {
  constructor(protected readonly repo: ITableRepository) {}

  async execute(command: MoveViewCommand): Promise<void> {
    const table = (await this.repo.findOneById(command.tableId)).unwrap();

    const spec = table.moveView(command);
    await this.repo.updateOneById(command.tableId, spec);
  }
}
