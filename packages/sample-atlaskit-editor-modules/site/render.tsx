import * as React from 'react';
import ReactDOM from 'react-dom';

// import { AppEgEditorTest as App } from './AppEgList';
import { AKEg1Basic as App } from './AppEgList';

const render = (Component) => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

render(App);

if ((module as any).hot) {
  (module as any).hot.accept('./AppEgList.ts', () => {
    render(App);
  });
}
