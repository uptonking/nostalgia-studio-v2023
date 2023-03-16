import './styles.css';

import React, { StrictMode } from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { NosEditor } from '../src';
import { initialData } from './config/initial-data';

// import { SimplePage } from './pages/Simple';

export const NosEditorApp = () => (
  <StrictMode>
    <div className='app'>
      <NosEditor id='main' initialValue={initialData} />
    </div>

    {/* <BrowserRouter>
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
        <Route path='/' element={<Navigate to='/remote-cursors-overlay' />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Navigator />
    </BrowserRouter> */}
  </StrictMode>
);


