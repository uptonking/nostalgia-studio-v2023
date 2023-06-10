import { type CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import { type IDuplicateRecordInput } from './duplicate-record.command.input';

export class DuplicateRecordCommand extends Command {
  readonly id: string;
  readonly tableId: string;

  constructor(props: CommandProps<IDuplicateRecordInput>) {
    super(props);
    this.tableId = props.tableId;
    this.id = props.id;
  }
}
