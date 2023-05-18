import {
  IUserRepository,
  UserFactory,
  WithUserEmail,
  WithUserId,
  WithUsername,
  WithUserPassword,
} from '@datalking/pivot-core';
import type { ICommandHandler } from '@datalking/pivot-entity';

import { IRegisterCommandOutput } from './register.command.interface';
import type { RegisterCommand } from './register.command';

type IRegisterCommandHandler = ICommandHandler<
  RegisterCommand,
  IRegisterCommandOutput
>;

export class RegisterCommandHandler implements IRegisterCommandHandler {
  constructor(protected readonly repo: IUserRepository) {}

  async execute({
    email,
    password,
  }: RegisterCommand): Promise<IRegisterCommandOutput> {
    const exists = await this.repo.exists(WithUserEmail.fromString(email));
    if (exists) throw new Error('user already exists');

    const user = UserFactory.create(
      WithUserEmail.fromString(email),
      WithUserPassword.fromString(password),
      WithUserId.create(),
      WithUsername.fromEmail(email),
    );

    await this.repo.insert(user);

    return { email, sub: user.userId.value };
  }
}
