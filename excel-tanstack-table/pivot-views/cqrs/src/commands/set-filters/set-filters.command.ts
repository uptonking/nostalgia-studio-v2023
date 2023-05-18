import { IFilterOrGroupList } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ISetFilterCommandInput } from './set-filters.command.interface';

export class SetFitlersCommand
  extends Command
  implements ISetFilterCommandInput
{
  readonly tableId: string;
  readonly viewId?: string;
  readonly filter: IFilterOrGroupList | null;

  constructor(props: CommandProps<ISetFilterCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.viewId = props.viewId;
    this.filter = props.filter;
  }
}
