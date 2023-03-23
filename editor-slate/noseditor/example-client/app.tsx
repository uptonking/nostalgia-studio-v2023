import './styles.css';

import React, { StrictMode } from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import type { YHistoryEditor, YjsEditor } from '@slate-yjs/core';

import { NosEditor } from '../src';
import { CustomEditor, CustomElement, CustomText } from '../src/types/slate.d';
import { ErrorBoundary } from './components/common/error-boundary';
import {
  SlateYjsEditorMinimal,
  TwoEditorsCollabNoServer,
} from './components/editors';
import { initialData, initialDataLong, simpleTableData } from './config';
import { EditorWithCursorOverlay } from './pages/remote-cursor-overlay';

// import { SimplePage } from './pages/Simple';

export const NosEditorApp = () => (
  <>
    <div className='app'>
      <ErrorBoundary fallback={<h3>editor is not rendering properly.</h3>}>
        {/* <EditorWithCursorOverlay /> */}
        {/* <TwoEditorsCollabNoServer /> */}
        <NosEditor id='main' initialValue={initialData} />
      </ErrorBoundary>
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
