import type { IQueryUser } from './user.type';
import type { UserId } from './value-objects/index';

export class User {
  public userId!: UserId;
  public username!: string;
  public password!: string;
  public email!: string;
  public avatar?: string;

  /** create a new User object */
  static empty() {
    return new User();
  }

  public toQuery(): IQueryUser {
    return {
      userId: this.userId.value,
      username: this.username,
      email: this.email,
      avatar: this.avatar,
    };
  }
}
