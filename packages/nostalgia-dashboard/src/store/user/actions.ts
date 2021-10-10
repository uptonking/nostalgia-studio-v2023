import { UserType } from '../../common/types';
import { LOGIN } from '../actions-constants';

export const login = (user: UserType) => ({
  type: LOGIN,
  user,
});
