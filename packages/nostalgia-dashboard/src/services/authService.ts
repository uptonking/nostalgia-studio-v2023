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

  const response = await fetch('/account/login', requestOptions);
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
