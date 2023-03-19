import './styles.css';

import React, { StrictMode } from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import { NosEditor } from '../src';
import { CustomEditor, CustomElement, CustomText } from '../src/types/slate.d';
import { initialData, initialDataLong, simpleTableData } from './config';

// import { SimplePage } from './pages/Simple';

export const NosEditorApp = () => (
  <>
    <div className='app'>
      <NosEditor id='main' initialValue={initialData} />
    </div>
    <StrictMode>
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
  </>
);

declare module 'slate' {
  interface CustomTypes {
    Editor: CustomEditor;
    Element: CustomElement;
    Text: CustomText;
    // Range: BaseRange | RemoteCursorDecoratedRange<CursorData>;
  }
}
