import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IDeleteTableInput } from './delete-table.command.input';

export class DeleteTableCommand extends Command {
  readonly id: string;

  constructor(props: CommandProps<IDeleteTableInput>) {
    super(props);
    this.id = props.id;
  }
}
