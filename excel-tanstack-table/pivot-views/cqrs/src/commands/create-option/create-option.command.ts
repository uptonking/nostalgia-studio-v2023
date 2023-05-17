import { ICreateOptionSchema } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type {
  ICreateOptionCommandInput,
} from './create-option.command.interface';

export class CreateOptionCommand
  extends Command
  implements ICreateOptionCommandInput
{
  readonly tableId: string;
  readonly fieldId: string;
  readonly option: ICreateOptionSchema;

  constructor(props: CommandProps<ICreateOptionCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.fieldId = props.fieldId;
    this.option = props.option;
  }
}
