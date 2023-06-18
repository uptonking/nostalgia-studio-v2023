import * as React from 'react';

import { createRoot } from 'react-dom/client';

// import { App } from './app';
import { ExamplesApp as App } from './examples';

const render = (Component) => {
  createRoot(document.querySelector('#root')!).render(<Component />);
};

render(App);

if ((module as any).hot) {
  (module as any).hot.accept('./examples.tsx', () => {
    render(App);
  });
}
