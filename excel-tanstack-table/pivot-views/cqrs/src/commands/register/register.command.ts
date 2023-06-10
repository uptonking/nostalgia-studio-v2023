import { type CommandProps } from '@datalking/pivot-entity';
import { Command } from '@datalking/pivot-entity';

import { type IRegisterCommandInput } from './register.command.interface';

export class RegisterCommand extends Command implements IRegisterCommandInput {
  readonly email: string;
  readonly password: string;

  constructor(props: CommandProps<IRegisterCommandInput>) {
    super(props);
    this.email = props.email;
    this.password = props.password;
  }
}
