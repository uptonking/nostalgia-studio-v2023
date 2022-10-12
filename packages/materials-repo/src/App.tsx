import 'fork-awesome/css/fork-awesome.css';

import './assets/scss/style.scss';

import * as React from 'react';
// import { HashRouter as Router } from 'react-router-dom';
import { BrowserRouter as Router } from 'react-router-dom';

import RoutesAll from './routes/RoutesAll';
import configureFakeBackend from './services/mock/fakeBackend';
import { GlobalProvider } from './store';

// import './index.scss';



// faking makes app work without backend api services.
// configureFakeBackend();

export function App() {
  return (
    <GlobalProvider>
      <Router>
        <RoutesAll />
      </Router>
    </GlobalProvider>
  );
}

export default App;
