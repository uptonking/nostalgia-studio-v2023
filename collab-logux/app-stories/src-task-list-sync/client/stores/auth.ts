import { map } from 'nanostores';

import { logout as logoutRequest, signIn } from '../lib/api';

export const authStore = map<{ id?: string }>({
  id: localStorage.getItem('id') ?? undefined,
});

export async function auth(data: {
  name: string;
  password: string;
}): Promise<void> {
  const res = await signIn(data);
  const userData = await res.json();
  if (res.ok) {
    authStore.setKey('id', userData.id);
  }
}

export function logout(): void {
  logoutRequest();
  authStore.setKey('id', undefined);
}

authStore.subscribe(
  ({ id }: { id?: string }, changedKey: string | undefined) => {
    if (changedKey === 'id') {
      if (id) {
        localStorage.setItem('id', id);
      } else {
        localStorage.removeItem('id');
      }
    }
  },
);
