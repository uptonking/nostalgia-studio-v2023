import type { CompositeSpecification } from '@datalking/pivot-entity';

import type { User } from '../user';
import type { WithUserAvatar } from './user-avatar.specification';
import type { WithUserEmail } from './user-email.specification';
import type { WithUserId } from './user-id.specification';
import type { WithUsername } from './username.specification';

export interface IUserSpecVisitor {
  idEqual(s: WithUserId): void;
  avatarEqual(s: WithUserAvatar): void;
  emailEqual(s: WithUserEmail): void;
  usernameEqual(s: WithUsername): void;
  not(): IUserSpecVisitor;
}

export type UserSpecification = CompositeSpecification<User, IUserSpecVisitor>;
