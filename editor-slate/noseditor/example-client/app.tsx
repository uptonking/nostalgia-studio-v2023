import '../src/styles/css-normalize.styles';
import './styles/app.styles';

import React, { StrictMode } from 'react';

import { NosEditorFullFeatures } from './pages/noseditor-full';

export const NosEditorFullApp = () => {
  return (
    <>
      <NosEditorFullFeatures />
      <StrictMode></StrictMode>
    </>
  );
};
