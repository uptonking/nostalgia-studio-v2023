import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IDeleteRecordInput } from './delete-record.command.input';

export class DeleteRecordCommand extends Command {
  readonly id: string;
  readonly tableId: string;

  constructor(props: CommandProps<IDeleteRecordInput>) {
    super(props);
    this.tableId = props.tableId;
    this.id = props.id;
  }
}
