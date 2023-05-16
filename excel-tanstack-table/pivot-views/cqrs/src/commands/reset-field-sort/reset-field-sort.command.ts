import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IResetFieldSortCommandInput } from './reset-field-sort.command.interface.js';

export class ResetFieldSortCommand
  extends Command
  implements IResetFieldSortCommandInput
{
  readonly tableId: string;
  readonly viewId?: string;
  readonly fieldId: string;

  constructor(props: CommandProps<IResetFieldSortCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.viewId = props.viewId;
    this.fieldId = props.fieldId;
  }
}
