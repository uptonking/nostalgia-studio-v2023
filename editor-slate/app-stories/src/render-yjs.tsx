import * as React from 'react';
import * as ReactDOM from 'react-dom';

// import { App } from './app';
import { YjsSlateApp as App } from '../yjs-client';

const render = (Component) => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

render(App);

if ((module as any).hot) {
  (module as any).hot.accept('./examples.tsx', () => {
    render(App);
  });
}
