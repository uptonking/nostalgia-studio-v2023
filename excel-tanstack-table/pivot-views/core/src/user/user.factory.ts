import { and } from '@datalking/pivot-entity';

import { type UserSpecification } from './specifications/index';
import {
  WithUserAvatar,
  WithUserEmail,
  WithUserId,
  WithUsername,
  WithUserPassword,
} from './specifications/index';
import { User } from './user';
import { type IUnsafeCreateUser } from './user.type';

export class UserFactory {
  static create(...specs: UserSpecification[]): User {
    return and(...specs)
      .unwrap()
      .mutate(User.empty())
      .unwrap();
  }

  static unsafeCreate(input: IUnsafeCreateUser): User {
    return this.create(
      WithUserEmail.fromString(input.email),
      WithUserId.fromString(input.userId),
      WithUserPassword.fromString(input.password),
      WithUsername.fromString(input.username),
      WithUserAvatar.fromString(input.avatar),
    );
  }
}
