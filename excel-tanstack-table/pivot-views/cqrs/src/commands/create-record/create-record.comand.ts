import { type IMutateRecordValueSchema } from '@datalking/pivot-core';
import { type CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import { type ICreateRecordInput } from './create-record.command.input';

export class CreateRecordCommand extends Command {
  readonly id?: string;
  readonly tableId: string;
  readonly values: IMutateRecordValueSchema;

  constructor(props: CommandProps<ICreateRecordInput>) {
    super(props);
    this.tableId = props.tableId;
    this.id = props.id;
    this.values = props.values;
  }
}
