import type { ICommandHandler } from '@datalking/pivot-entity';

import { ILoginCommandOutput } from './login.command.interface';
import type { LoginCommand } from './login.command';

type ILoginCommandHandler = ICommandHandler<LoginCommand, ILoginCommandOutput>;

export class LoginCommandHandler implements ILoginCommandHandler {
  async execute({ user }: LoginCommand): Promise<ILoginCommandOutput> {
    const payload = { email: user.email, sub: user.userId };
    return payload;
  }
}
