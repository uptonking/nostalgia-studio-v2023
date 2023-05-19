import React, { useEffect } from 'react';

import { useStore } from '@nanostores/react';
import { redirectPage } from '@nanostores/router';

import { authStore, logout } from '../stores/auth';
import { router } from '../stores/router';

export const LogoutPage = (): null => {
  const { id: userId } = useStore(authStore);

  useEffect(() => {
    if (userId) {
      logout();
    } else {
      redirectPage(router, 'main');
    }
  }, [userId]);

  return null;
};
