import { IQueryUser } from '@datalking/pivot-core';
import type { CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import type { ILoginCommandInput } from './login.command.interface';

export class LoginCommand extends Command implements ILoginCommandInput {
  readonly user: IQueryUser;

  constructor(props: CommandProps<ILoginCommandInput>) {
    super(props);
    this.user = props.user;
  }
}
