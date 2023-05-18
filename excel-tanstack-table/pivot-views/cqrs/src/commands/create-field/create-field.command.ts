import { ICreateFieldSchema } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ICreateFieldCommandInput } from './create-field.command.interface';

export class CreateFieldCommand
  extends Command
  implements ICreateFieldCommandInput
{
  public readonly tableId: string;
  public readonly viewId?: string;
  public readonly at?: number;
  public readonly field: ICreateFieldSchema;

  constructor(props: CommandProps<ICreateFieldCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.viewId = props.viewId;
    this.at = props.at;
    this.field = props.field;
  }
}
