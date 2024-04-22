import * as React from 'react';

import { createRoot } from 'react-dom/client';

import { NosEditorFullApp as App } from './app';

const render = (Component) => {
  createRoot(document.getElementById('root')).render(<Component />);
};

render(App);

// if ((module as any).hot) {
//   (module as any).hot.accept('./app.tsx', () => {
//     render(App);
//   });
// }
