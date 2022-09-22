// import './index.css';

import * as React from 'react';

import { PMExampleSetupBasicEditor } from './stories/examples-docs/a1-starter/a12-example-setup-basic-editor';

export function App() {
  return (
    <div>
      <h1>本项目 prosemirror-ui-stories</h1>
      <a href='https://github.com/examples-hub/react-monorepo-starter-ts'>
        <h4>github repo</h4>
      </a>
      <div>
        <br />
        <input type='text' />
      </div>
      <div>
        <hr />
        <PMExampleSetupBasicEditor />
      </div>
    </div>
  );
}

export default App;
