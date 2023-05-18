import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IDuplicateViewInput } from './duplicate-view.command.input';

export class DuplicateViewCommand extends Command {
  readonly id: string;
  readonly tableId: string;

  constructor(props: CommandProps<IDuplicateViewInput>) {
    super(props);
    this.tableId = props.tableId;
    this.id = props.id;
  }
}
