import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ISetCalendarFieldCommandInput } from './set-calendar-field.command.interface.js';

export class SetCalendarFieldCommand
  extends Command
  implements ISetCalendarFieldCommandInput
{
  readonly tableId: string;
  readonly viewId?: string;
  readonly field: string;

  constructor(props: CommandProps<ISetCalendarFieldCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.viewId = props.viewId;
    this.field = props.field;
  }
}
