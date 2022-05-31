import * as React from 'react';
import * as ReactDOM from 'react-dom';

import './index.css';
import { LotsOfItemsWithinContainer } from '../examples-docs/a1-starter/a11-minimal';

export function App() {
  return (
    <div>
      <h1>本项目 list-menu</h1>
      <a href='https://github.com/examples-hub/react-monorepo-starter-ts'>
        <h4>github repo</h4>
      </a>
      <div>
        <br />
        <input type='text' />
      </div>
      <div>
        <hr />
        <LotsOfItemsWithinContainer />
      </div>
    </div>
  );
}

export default App;

ReactDOM.render(<App />, document.getElementById('root'));
