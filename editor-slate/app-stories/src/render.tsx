import * as React from 'react';
import * as ReactDOM from 'react-dom';

// import { App } from './app';
import { ExamplesApp as App } from './examples';

const render = (Component) => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

render(App);

if ((module as any).hot) {
  (module as any).hot.accept('./examples.tsx', () => {
    render(App);
  });
}
