import type { UserResponseType, UserType } from '../../common/types';

declare global {
  interface Window {
    fetch: any;
  }
}
export type ReqOptions = {
  method?: 'POST' | 'GET' | 'DELETE';
  headers?: any;
  body?: string;
};
export type ResOptions = {
  ok?: boolean;
  status?: number;
  text: () => Promise<string>;
};

// const localUser = JSON.parse(localStorage.getItem('curuser'));

// let users: UserType[] = localUser ? [localUser] : [
/** 模拟已存在的测试用户 */
let users: UserType[] = [
  { id: 101, username: 'test', password: '111111', roles: ['user'] },
  { id: 1, username: 'admin', password: '111111', roles: ['admin'] },
];

/**
 * 拦截window.fetch的部分url请求，实现无需服务端api仍然可运行示例程序。
 */
export function configureFakeBackend() {
  const realFetch = window.fetch;

  window.fetch = function (url: string, opts: ReqOptions): Promise<ResOptions> {
    const { method, headers, body } =
      (typeof opts !== 'undefined' && opts) || {};
    // const reqBody = opts.body && JSON.parse(opts.body);
    const reqBody = body && JSON.parse(body);
    console.log(';;/fetch-mock-api-url, ', url);

    return new Promise((resolve, reject) => {
      // wrap in timeout to simulate server api call
      setTimeout(handleRoute, 1500);

      function handleRoute() {
        switch (true) {
          case url.endsWith('/account/login') && method === 'POST':
            return authenticate();
          case url.endsWith('/account/register') && method === 'POST':
            return register();
          case url.endsWith('/users') && method === 'GET':
            return getUsers();
          case url.match(/\/users\/\d+$/) && method === 'DELETE':
            return deleteUser();
          case url.endsWith('/profile') && method === 'GET':
            return getProfile();
          default:
            // pass through any requests not handled above
            return realFetch(url, opts)
              .then((response: any) => resolve(response))
              .catch((error: any) => reject(error));
        }
      }

      // route functions

      /** 验证用户名和密码，返回jwt token */
      function authenticate() {
        const { username, password } = reqBody;
        console.log(';;auth-db-users, ', users);
        const user = users.find(
          (user: UserType) =>
            (user.username === username || user.email === username) &&
            user.password === password,
        );

        if (!user) {
          // return error('Username or password is incorrect');
          return error('用户名或密码错误');
        }

        return ok({
          id: user.id,
          username: user.username,
          email: user.email,
          roles: user.roles,
          token: `fake-jwt-token-${user.id}`,
        });
      }

      /** 注册用户，若成功则返回jwt用于跳过登录直接跳转到首页 */
      function register() {
        const user: UserType = reqBody;

        if (users.find((u: UserType) => u.username === user.username)) {
          return error(`用户名 ${user.username} 已被注册，请更换`);
        }

        // assign user id and a few other properties then save
        user.id = users.length
          ? Math.max(
              ...(users as UserType[]).map((user: UserType) => user.id),
            ) + 1
          : 1;
        user.roles = user.roles && user.roles.length ? user.roles : ['user'];
        user.token = `fake-jwt  -token-${user.id}`;

        // users.push(user); // 模拟保存用户到数据库
        users = [...users, user];

        const { password, ...currentUser } = user;
        console.log(';;registered-db-users ', users);

        return ok({
          ...currentUser,
        });
      }

      /** 模拟验证jwt */
      function getProfile() {
        if (headers['Authorization'].includes('Bearer fake-jwt-token')) {
          const token: string = headers['Authorization'].split(' ')[1];
          const user: UserType | undefined = users.find(
            (user) => user.token === token,
          );
          console.log(';;ing: getProfile with jwt token');

          if (user) {
            return ok({
              id: user.id,
              username: user.username,
              email: user.email,
              token: `fake-jwt-token-${user.id}`,
            });
          }
        }
      }

      function getUsers() {
        if (!isLoggedIn()) return unauthorized();

        return ok(users);
      }

      function deleteUser() {
        if (!isLoggedIn()) return unauthorized();

        users = users.filter((x) => x.id !== idFromUrl());
        localStorage.setItem('users', JSON.stringify(users));
        return ok();
      }

      // helper functions

      /** 创建 Promise.resolve 200 */
      function ok(body?: UserResponseType | UserResponseType[]) {
        resolve({
          ok: true,
          text: () => Promise.resolve(JSON.stringify(body)),
        });
      }

      /** 创建 Promise.resolve 401 */
      function unauthorized() {
        resolve({
          status: 401,
          text: () =>
            Promise.resolve(JSON.stringify({ message: 'Unauthorized' })),
        });
      }

      /** 创建 Promise.resolve 400 */
      function error(message: string) {
        resolve({
          status: 400,
          text: () => Promise.resolve(JSON.stringify({ message })),
        });
      }

      function isLoggedIn() {
        return headers['Authorization'] === 'Bearer fake-jwt-token';
      }

      function idFromUrl() {
        const urlParts = url.split('/');
        return parseInt(urlParts[urlParts.length - 1], 10);
      }
    });
  };
}

export default configureFakeBackend;
