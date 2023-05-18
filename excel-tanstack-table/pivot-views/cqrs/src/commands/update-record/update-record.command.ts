import { IMutateRecordValueSchema } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IUpdateRecordCommandInput } from './update-record.command.input';

export class UpdateRecordCommand
  extends Command
  implements IUpdateRecordCommandInput
{
  readonly id: string;
  readonly tableId: string;
  readonly values: IMutateRecordValueSchema;

  constructor(props: CommandProps<IUpdateRecordCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.id = props.id;
    this.values = props.values;
  }
}
