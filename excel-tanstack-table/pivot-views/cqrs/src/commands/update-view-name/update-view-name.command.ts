import { IUpdateViewNameSchema } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IUpdateViewNameCommandInput } from './update-view-name.command.interface.js';

export class UpdateViewNameCommand
  extends Command
  implements IUpdateViewNameCommandInput
{
  public readonly tableId: string;
  public readonly view: IUpdateViewNameSchema;

  constructor(props: CommandProps<IUpdateViewNameCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.view = props.view;
  }
}
