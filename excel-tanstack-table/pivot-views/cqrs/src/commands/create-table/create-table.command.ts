import { ICreateTableSchemaInput } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ICreateTableInput } from './create-table.command.interface.js';

export class CreateTableCommand extends Command implements ICreateTableInput {
  readonly name: string;
  readonly emoji?: string;
  readonly schema: ICreateTableSchemaInput;

  constructor(props: CommandProps<ICreateTableInput>) {
    super(props);
    this.name = props.name;
    this.emoji = props.emoji;
    this.schema = props.schema;
  }
}
