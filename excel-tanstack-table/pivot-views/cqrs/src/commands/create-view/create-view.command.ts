import { ICreateViewSchema } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ICreateViewCommandInput } from './create-view.command.interface.js';

export class CreateViewCommand
  extends Command
  implements ICreateViewCommandInput
{
  public readonly tableId: string;
  public readonly view: ICreateViewSchema;

  constructor(props: CommandProps<ICreateViewCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.view = props.view;
  }
}
