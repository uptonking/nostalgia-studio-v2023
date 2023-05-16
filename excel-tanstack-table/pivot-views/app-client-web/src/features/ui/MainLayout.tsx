import React from 'react';

import CssBaseline from '@mui/material/CssBaseline';

import { getCurrentRoute } from '../../shared/routes';
import { SocketListener } from '../app/SocketListener';
import { AuthProviders } from '../profile/AuthProviders';
import { Dialogs } from './Dialogs';
import { DrawerRight } from './Drawer';
import { Footer } from './Footer';
import { HeaderNavBar as Header } from './Header';
import { LoadingLine } from './LoadingLine';
import { Notifications } from './Notifications';
import { RouteElement, Routings } from './Routing';

export function MainLayout() {
  const route = getCurrentRoute();
  if (route?.cleanLayout) {
    return <RouteElement route={route} />;
  }

  return (
    <React.Fragment>
      <CssBaseline />
      <LoadingLine />
      <Header />
      <main>
        <Routings />
      </main>
      <Notifications />
      <DrawerRight />
      <Footer />
      <Dialogs />
      {/* <AuthProviders /> */}
      {/* <SocketListener /> */}
    </React.Fragment>
  );
}
