import * as React from 'react';

import { createRoot } from 'react-dom/client';

// import { DocsStories as App } from './docs';
// import { AppShell as App } from './app';
import { ExamplesApp as App } from './examples';

const rootElem = document.getElementById('root');
const rootRender = createRoot(rootElem);

const render = (Component) => {
  rootRender.render(<Component container={rootElem} />);
};

render(App);

// if ((module as any).hot) {
//   (module as any).hot.accept('./examples.tsx', () => {
//     root.render(App);
//   });
// }
