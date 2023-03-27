import './styles/styles.scss';

import React, { StrictMode } from 'react';

// import {
//   ErrorBoundary,
//   errorFallbackCss,
// } from './components/common/error-boundary';
import { NosEditorFullFeatures } from './pages/noseditor-full';

export const NosEditorFullApp = () => {
  return (
    <>
      {/* <ErrorBoundary
        fallback={
          <h3 className={errorFallbackCss}>Editor is not rendering properly.</h3>
        }
      > */}
      <NosEditorFullFeatures />
      {/* </ErrorBoundary> */}
      <StrictMode></StrictMode>
    </>
  );
};
