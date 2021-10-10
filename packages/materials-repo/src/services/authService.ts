import { SERVER_BASE_URL } from '../common/constants';
import { UserType } from '../common/types';
import axios from '../utils/redaxios';

/** 登录账户，验证用户名、密码 */
export async function loginAccount(user: UserType) {
  const res = await axios.post(
    `${SERVER_BASE_URL}/account/login`,
    { ...user },
    { withCredentials: true },
  );
  return res.data;
}

/** 退出登录 */
export async function logoutAccount() {
  const res = await axios.post(`${SERVER_BASE_URL}/account/logout`, undefined, {
    withCredentials: true,
  });
  return res.data;
}

// 判断自动登录
export async function autoLoginAccount() {
  const res = await axios.get('/autoLogin');
  return res.data;
}

/** 注册请求 */
export async function registerAccount(user: UserType) {
  const res = await axios.post(
    `${SERVER_BASE_URL}/account/register`,
    { ...user },
    { withCredentials: true },
  );
  return res.data;
}

// #region /folded mock test old version
interface IResponse extends Response {
  text: () => Promise<any>;
}

async function handleResponse(response: IResponse) {
  const text = await response.text();
  const data: any = text && JSON.parse(text);
  if (!response.ok) {
    if (response.status === 401) {
      console.log(';;handleResponse 401');
    }
    if (response.status === 400) {
      console.log(';;handleResponse 400');
    }

    const error = (data && data.message) || response.statusText;
    return Promise.reject(error);
  }

  return data;
}

export async function register<T>(user: T) {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'applications/json' },
    body: JSON.stringify(user),
  };

  const response = await fetch('/account/register', requestOptions);

  return handleResponse(response);
}

export async function login({
  username,
  password,
}: {
  username: string;
  password: string;
}) {
  const requestOptions: RequestInit = {
    method: 'POST',
    headers: { 'Content-Type': 'applications/json' },
    body: JSON.stringify({ username, password }),
  };

  // ! 测试时只模拟了这一步，其他计算逻辑会正常执行
  const response = await fetch(`/account/login`, requestOptions);
  return handleResponse(response);
}

async function profileFetch(token: string) {
  const requestOptions: RequestInit = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  };

  const response = await fetch('/account/profile', requestOptions);
  return handleResponse(response);
}

// #endregion /folded mock test old version
