import React from 'react';

import { useStore } from '@nanostores/react';
import { redirectPage } from '@nanostores/router';

import { LoginPage } from '../../pages/LoginPage';
import { LogoutPage } from '../../pages/LogoutPage';
import { MainPage } from '../../pages/MainPage';
import { NotFoundPage } from '../../pages/NotFoundPage';
import { authStore } from '../../stores/auth';
import { router } from '../../stores/router';

export const Routes = (): JSX.Element | null => {
  const page = useStore(router);
  const { id: userId } = useStore(authStore);

  if (!page) {
    return <NotFoundPage />;
  }

  if (!userId) {
    redirectPage(router, 'login');
  } else if (page.route === 'login') {
    redirectPage(router, 'main');
  }

  switch (page.route) {
    case 'login':
      return <LoginPage />;
    case 'main':
      return <MainPage />;
    case 'logout':
      return <LogoutPage />;
  }

  return null;
};

export default Routes;
