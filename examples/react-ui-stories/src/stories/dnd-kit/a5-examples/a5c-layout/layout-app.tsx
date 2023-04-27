import React from 'react';

import { Layout } from './page';
import { Pages } from './pages';

const EgContainer = ({ children }) => (
  <div style={{ minWidth: 560, maxWidth: 720 }}>{children}</div>
);

export const Horizontal = () => (
  <EgContainer>
    <Pages layout={Layout.Horizontal} />
  </EgContainer>
);

export const Vertical = () => (
  <EgContainer>
    <Pages layout={Layout.Vertical} />
  </EgContainer>
);

export const Grid = () => (
  <EgContainer>
    <Pages layout={Layout.Grid} />
  </EgContainer>
);
