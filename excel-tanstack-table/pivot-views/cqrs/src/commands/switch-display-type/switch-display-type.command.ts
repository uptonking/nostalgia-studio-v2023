import { IViewDisplayType } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ISwitchDisplayTypeCommandInput } from './switch-display-type.command.interface.js';

export class SwitchDisplayTypeCommand
  extends Command
  implements ISwitchDisplayTypeCommandInput
{
  public readonly tableId: string;
  public readonly viewId?: string;
  public readonly displayType: IViewDisplayType;

  constructor(props: CommandProps<ISwitchDisplayTypeCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.viewId = props.viewId;
    this.displayType = props.displayType;
  }
}
