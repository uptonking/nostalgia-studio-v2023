import * as React from 'react';
import ReactDOM from 'react-dom';

// import { App } from './app';
import { TeemuApp as App } from './index';

const render = (Component: React.FunctionComponent) => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

render(App);

if ((module as any).hot) {
  (module as any).hot.accept('./index.tsx', () => {
    render(App);
  });
}
