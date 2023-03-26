import './styles.scss';

import React, { StrictMode } from 'react';

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import type { YHistoryEditor, YjsEditor } from '@slate-yjs/core';

import { NosEditor } from '../src';
import { ErrorBoundary } from './components/common/error-boundary';
import {
  SlateYjsEditorMinimal,
  TwoEditorsCollabNoServer,
} from './components/editors';
import { initialData, initialDataLong, simpleTableData } from './config';
import { NosEditorFullFeatures } from './pages/noseditor-full';
import { EditorWithCursorOverlay } from './pages/remote-cursor-overlay';

export const NosEditorFullApp = () => {
  return (
    <>
      <ErrorBoundary fallback={<h3>editor is not rendering properly.</h3>}>
        <NosEditorFullFeatures />
      </ErrorBoundary>
      <StrictMode></StrictMode>
    </>
  );
};

export const NosEditorApp = () => (
  <>
    <div className='app'>
      <ErrorBoundary fallback={<h3>editor is not rendering properly.</h3>}>
        {/* <EditorWithCursorOverlay /> */}
        {/* <TwoEditorsCollabNoServer /> */}
        {/* <NosEditor id='main' initialValue={initialData} /> */}
        <NosEditorFullFeatures />
      </ErrorBoundary>
    </div>
    <StrictMode>
      {/* <BrowserRouter>
      <Routes>
        <Route path='/simple' element={<SimplePage />} />
        <Route path='*' element={<NotFound />} />
      </Routes>
      <Navigator />
    </BrowserRouter> */}
    </StrictMode>
  </>
);
