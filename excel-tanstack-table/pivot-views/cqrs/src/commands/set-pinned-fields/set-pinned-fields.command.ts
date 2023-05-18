import { IViewPinnedFields } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ISetPinnedFieldsCommandInput } from './set-pinned-fields.command.interface';

export class SetPinnedFieldsCommand
  extends Command
  implements ISetPinnedFieldsCommandInput
{
  public readonly tableId: string;
  public readonly viewId?: string;
  public readonly pinnedFields: IViewPinnedFields;

  constructor(props: CommandProps<ISetPinnedFieldsCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.viewId = props.viewId;
    this.pinnedFields = props.pinnedFields;
  }
}
