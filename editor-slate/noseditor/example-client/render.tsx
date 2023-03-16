import * as React from 'react';
import * as ReactDOM from 'react-dom';

import { NosEditorApp as App } from './app';

const render = (Component) => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

render(App);

if ((module as any).hot) {
  (module as any).hot.accept('./app.tsx', () => {
    render(App);
  });
}
