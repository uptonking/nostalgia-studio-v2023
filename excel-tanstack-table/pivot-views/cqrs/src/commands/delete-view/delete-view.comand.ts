import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IDeleteViewInput } from './delete-view.command.input';

export class DeleteViewCommand extends Command {
  readonly id: string;
  readonly tableId: string;

  constructor(props: CommandProps<IDeleteViewInput>) {
    super(props);
    this.tableId = props.tableId;
    this.id = props.id;
  }
}
