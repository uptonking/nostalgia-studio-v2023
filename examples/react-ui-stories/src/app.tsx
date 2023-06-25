// import './index.css';

import * as React from 'react';

import { A5b1VirtualQuery } from './stories/tanstack-virtual';

export function App() {
  return (
    <div>
      <h1>本项目 react-ui-stories</h1>
      <div>
        <A5b1VirtualQuery />
      </div>
    </div>
  );
}

export { AppShell, Switch } from '@pgd/ui-react';

export default App;
