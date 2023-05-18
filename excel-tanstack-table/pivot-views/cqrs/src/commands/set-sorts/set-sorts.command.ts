import { ISorts } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ISetSortsCommandInput } from './set-sorts.command.interface';

export class SetSortsCommand extends Command implements ISetSortsCommandInput {
  readonly tableId: string;
  readonly viewId?: string;
  readonly sorts: ISorts;

  constructor(props: CommandProps<ISetSortsCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.viewId = props.viewId;
    this.sorts = props.sorts;
  }
}
