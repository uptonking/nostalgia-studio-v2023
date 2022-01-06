import * as React from 'react';
import { CheckboxWithLabel } from '@examples-hub/sample-react-components-ts';

import './index.css';

export function App() {
  return (
    <div>
      <h1>本项目 react-monorepo-starter-ts</h1>
      <a href='https://github.com/examples-hub/react-monorepo-starter-ts'>
        <h4>github repo</h4>
      </a>
      <div>
        <br />
        <input type='text' />
      </div>
      <div>
        <hr />
        <CheckboxWithLabel labelOn='On' labelOff='Off' />
      </div>
    </div>
  );
}

export default App;
