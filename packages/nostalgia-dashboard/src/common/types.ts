import {
  AUTHENTICATE_ERROR,
  AUTHENTICATE_START,
  AUTHENTICATE_SUCCESS,
  LOGIN,
  LOGOUT,
  REGISTER_ERROR,
  REGISTER_START,
  REGISTER_SUCCESS,
} from '../store/actions-constants';

export type UserType = {
  id?: number;
  username: string;
  password: string;
  displayName?: string;
  email?: string;
  phonenumber?: string;
  token?: string;
  roles?: string[];
};

export type CurrentUserType = {
  username: string;
};

export type UserResponseType = Omit<UserType, 'password'>;

export type MessageResponseType = {
  message: string;
};

export type RegisterRequestAction = {
  type: typeof REGISTER_START;
};

export type RegisterSuccessAction = {
  type: typeof REGISTER_SUCCESS;
};

export type RegisterErrorAction = {
  type: typeof REGISTER_ERROR;
};

export type LoginAction = {
  type: typeof LOGIN;
  user: UserResponseType;
};
export type LogoutAction = {
  type: typeof LOGOUT;
};

export type AuthenticateRequestAction = {
  type: typeof AUTHENTICATE_START;
};

export type AuthenticateSuccessAction = {
  type: typeof AUTHENTICATE_SUCCESS;
  user: { username: string; password: string };
};

export type AuthenticateErrorAction = {
  type: typeof AUTHENTICATE_ERROR;
};
