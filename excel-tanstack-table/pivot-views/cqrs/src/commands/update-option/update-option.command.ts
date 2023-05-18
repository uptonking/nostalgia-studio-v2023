import { IUpdateOptionSchema } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IUpdateOptionCommandInput } from './update-option.command.interface';

export class UpdateOptionCommand
  extends Command
  implements IUpdateOptionCommandInput
{
  readonly tableId: string;
  readonly fieldId: string;
  readonly id: string;
  readonly option: IUpdateOptionSchema;

  constructor(props: CommandProps<IUpdateOptionCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.fieldId = props.fieldId;
    this.id = props.id;
    this.option = props.option;
  }
}
