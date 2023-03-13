import './styles.css';

import React, { StrictMode } from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { Navigator } from './components/Navigator/Navigator';
import { NotFound } from './pages/NotFound';
import { RemoteCursorDecorations } from './pages/RemoteCursorDecorations';
import { RemoteCursorsOverlayPage } from './pages/RemoteCursorOverlay';
import { SimplePage } from './pages/Simple';

export const YjsSlateApp = () => (
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path='/simple' element={<SimplePage />} />
        <Route
          path='/remote-cursors-overlay'
          element={<RemoteCursorsOverlayPage />}
        />
        <Route
          path='/remote-cursors-decoration'
          element={<RemoteCursorDecorations />}
        />
        {/* <Route path='/' element={<Navigate to='/simple' />} /> */}
        <Route path='/' element={<Navigate to='/remote-cursors-overlay' />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Navigator />
    </BrowserRouter>
  </StrictMode>
);

// ReactDOM.render(<YjsSlateApp />, document.getElementById('root'));
