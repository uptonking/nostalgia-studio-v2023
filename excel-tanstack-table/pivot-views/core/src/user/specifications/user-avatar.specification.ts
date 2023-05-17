import type { Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';

import { CompositeSpecification } from '@datalking/pivot-entity';

import type { User } from '../user';
import type { IUserSpecVisitor } from './interface';

export class WithUserAvatar extends CompositeSpecification<
  User,
  IUserSpecVisitor
> {
  constructor(public readonly avatar?: string) {
    super();
  }

  static fromString(avatar?: string): WithUserAvatar {
    return new WithUserAvatar(avatar);
  }

  isSatisfiedBy(t: User): boolean {
    return this.avatar === t.avatar;
  }

  mutate(t: User): Result<User, string> {
    t.avatar = this.avatar;
    return Ok(t);
  }

  accept(v: IUserSpecVisitor): Result<void, string> {
    v.avatarEqual(this);
    return Ok(undefined);
  }
}
