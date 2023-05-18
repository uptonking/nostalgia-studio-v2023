import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ISetShowSystemFieldsCommandInput } from './set-show-system-fields.command.interface';

export class SetShowSystemFieldsCommand
  extends Command
  implements ISetShowSystemFieldsCommandInput
{
  readonly tableId: string;
  readonly viewId?: string;
  readonly showSystemFields: boolean;

  constructor(props: CommandProps<ISetShowSystemFieldsCommandInput>) {
    super(props);
    this.tableId = props.tableId;
    this.viewId = props.viewId;
    this.showSystemFields = props.showSystemFields;
  }
}
