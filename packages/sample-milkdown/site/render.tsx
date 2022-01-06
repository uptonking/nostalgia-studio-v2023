import * as React from 'react';
import ReactDOM from 'react-dom';

import { AppEgEditorReact as App } from './AppEgList';

const render = (Component) => {
  ReactDOM.render(<Component />, document.getElementById('root'));
};

render(App);

if ((module as any).hot) {
  (module as any).hot.accept('./AppEgList.ts', () => {
    render(App);
  });
}
