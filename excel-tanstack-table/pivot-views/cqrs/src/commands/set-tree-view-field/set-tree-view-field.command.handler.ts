import { type ITableRepository } from '@datalking/pivot-core';
import { type ICommandHandler } from '@datalking/pivot-entity';

import { type SetTreeViewFieldCommand } from './set-tree-view-field.command';

type ISetTreeViewFieldCommandHandler = ICommandHandler<
  SetTreeViewFieldCommand,
  void
>;

export class SetTreeViewFieldCommandHandler
  implements ISetTreeViewFieldCommandHandler
{
  constructor(protected readonly repo: ITableRepository) {}

  async execute(command: SetTreeViewFieldCommand): Promise<void> {
    const table = (await this.repo.findOneById(command.tableId)).unwrap();

    const spec = table.setTreeViewField(command);

    await this.repo.updateOneById(table.id.value, spec);
  }
}
