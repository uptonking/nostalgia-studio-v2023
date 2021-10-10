import type {
  LoginAction,
  LogoutAction,
  UserResponseType,
} from '../../common/types';
import { LOGIN, LOGOUT } from '../actions-constants';

export type UserStateType = {
  user?: null | UserResponseType;
};

export function getUserInitialState(): UserStateType {
  return {
    user: null,
  };
}

type ActionTypes = LoginAction | LogoutAction;

export const userReducer = (
  state = getUserInitialState(),
  action: ActionTypes,
): UserStateType => {
  switch (action.type) {
    case LOGIN: {
      return {
        ...state,
        user: action.user,
      };
    }

    case LOGOUT: {
      return { ...state, user: null };
    }

    default:
      return state;
  }
};
