import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { IUpdateTableCommandInput } from './update-table.command.interface';

export class UpdateTableCommand
  extends Command
  implements IUpdateTableCommandInput
{
  public readonly id: string;
  public readonly name?: string;
  public readonly emoji?: string;

  constructor(props: CommandProps<IUpdateTableCommandInput>) {
    super(props);
    this.id = props.id;
    this.name = props.name;
    this.emoji = props.emoji;
  }
}
