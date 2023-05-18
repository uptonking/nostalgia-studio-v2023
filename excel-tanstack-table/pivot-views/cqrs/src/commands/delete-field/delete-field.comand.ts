import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IDeleteFieldInput } from './delete-field.command.input';

export class DeleteFieldCommand extends Command {
  readonly id: string;
  readonly tableId: string;

  constructor(props: CommandProps<IDeleteFieldInput>) {
    super(props);
    this.tableId = props.tableId;
    this.id = props.id;
  }
}
