import { type CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import { type IDeleteOptionInput } from './delete-option.command.input';

export class DeleteOptionCommand extends Command implements IDeleteOptionInput {
  readonly id: string;
  readonly fieldId: string;
  readonly tableId: string;

  constructor(props: CommandProps<IDeleteOptionInput>) {
    super(props);
    this.tableId = props.tableId;
    this.fieldId = props.fieldId;
    this.id = props.id;
  }
}
