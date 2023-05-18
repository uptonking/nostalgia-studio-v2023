import type { Result } from 'oxide.ts';
import { Ok } from 'oxide.ts';

import { CompositeSpecification } from '@datalking/pivot-entity';

import type { User } from '../user';
import type { IUserSpecVisitor } from './interface';

export class WithUserEmail extends CompositeSpecification<
  User,
  IUserSpecVisitor
> {
  constructor(public readonly email: string) {
    super();
  }

  static fromString(email: string): WithUserEmail {
    return new WithUserEmail(email);
  }

  isSatisfiedBy(t: User): boolean {
    return this.email === t.email;
  }

  mutate(t: User): Result<User, string> {
    t.email = this.email;
    return Ok(t);
  }

  accept(v: IUserSpecVisitor): Result<void, string> {
    v.emailEqual(this);
    return Ok(undefined);
  }
}
