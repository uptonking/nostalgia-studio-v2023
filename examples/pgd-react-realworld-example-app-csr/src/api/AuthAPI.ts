import { IUser } from '../types';
import { setLocalStorage } from '../utils';
import API, { TOKEN_KEY, setToken } from './APIUtils';
import mockApi from './mockApi';

type User = {
  user: IUser & { token: string };
};

function handleUserResponse({ user: { token, ...user } }: User) {
  setLocalStorage(TOKEN_KEY, token);
  setToken(token);
  return user;
}

export function getCurrentUser() {
  return API.get<User>('/user');
}

export function login(email: string, password: string) {
  // return API.post<User>('/users/login', {
  //   user: { email, password },
  // }).then((user) => handleUserResponse(user.data));

  return mockApi
    .loginByEmail({
      user: { email, password },
    })
    .then((resUser) => {
      console.log(`==logging user, `, JSON.stringify(resUser));
      return handleUserResponse((resUser as any).data);
    });
}

export function register(user: {
  username: string;
  email: string;
  password: string;
}) {
  // return API.post<User>('/users', { user }).then((user) =>
  //   handleUserResponse(user.data),
  // );

  return mockApi.createUser({ user }).then((resUser) => {
    console.log(`==registered user, `, JSON.stringify(resUser));
    return handleUserResponse((resUser as any).data);
  });
}

export function updateUser(user: IUser & Partial<{ password: string }>) {
  // return API.put<User>('/user', { user });

  return mockApi.updateUser({ user });
}

export function logout() {
  localStorage.removeItem(TOKEN_KEY);
  setToken(null);
}
