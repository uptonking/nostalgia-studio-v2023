import './index.css';

import { Provider } from 'mobx-react';
import * as React from 'react';

import { Toaster } from './components/Toaster';
import { Routes } from './routes';
import { Stores } from './stores';
import { confMobx } from './stores/mobxConf';

// import { createRoot } from 'react-dom/client';

export const stores = new Stores();

confMobx();

export const TeemuApp = () => {
  return (
    <Provider {...stores}>
      <Routes />
      <Toaster />
    </Provider>
  );
};

// const container = document.getElementById('root');
// const root = createRoot(container as HTMLElement);
// root.render(<TeemuApp />);
