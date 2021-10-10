import {
  AUTHENTICATE_ERROR,
  AUTHENTICATE_START,
  AUTHENTICATE_SUCCESS,
  REGISTER_START,
} from '../actions-constants';

export type AuthStateType = {
  /** 本次登录已通过用户名密码验证 */
  isAuthenticated?: boolean;
  isRegistering?: boolean;
};

export function getAuthInitialState(): AuthStateType {
  return {
    isAuthenticated: false,
    isRegistering: false,
  };
}

type ActionType = any;

/** 本次会话相关的认证信息 */
export const authReducer = (
  state = getAuthInitialState(),
  action: ActionType,
): AuthStateType => {
  switch (action.type) {
    case AUTHENTICATE_START:
      return state;

    case AUTHENTICATE_SUCCESS:
      return {
        ...state,
        isAuthenticated: true,
      };

    case AUTHENTICATE_ERROR:
      return {
        ...state,
        isAuthenticated: false,
      };
    case REGISTER_START:
      return { ...state, isRegistering: true };

    default:
      return state;
  }
};
