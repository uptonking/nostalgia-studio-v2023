import { ISortDirection } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ISetFieldSortCommandInput } from './set-field-sort.command.interface';

export class SetFieldSortCommand
  extends Command
  implements ISetFieldSortCommandInput
{
  readonly tableId: string;
  readonly viewId?: string;
  readonly fieldId: string;
  readonly direction: ISortDirection;

  constructor(props: CommandProps<ISetFieldSortCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.viewId = props.viewId;
    this.fieldId = props.fieldId;
    this.direction = props.direction;
  }
}
