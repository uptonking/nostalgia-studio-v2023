import './index.css';

import * as React from 'react';

import {
  Accordion,
  Button,
  Item,
  Provider,
  View,
  darkTheme,
  defaultTheme,
  lightTheme,
} from './index';

export function App(props = {}) {
  return (
    // <Provider theme={darkTheme}>
    <Provider theme={lightTheme}>
      {/* <Provider theme={defaultTheme}> */}
      {/* <Button variant='cta'>Hello spectrum</Button> */}
      <div style={{ width: 'auto', margin: '24px' }}>
        <Accordion>
          <Item key='files' title='Your files'>
            files accordion
          </Item>
        </Accordion>
      </div>
    </Provider>
  );
}

export default App;
