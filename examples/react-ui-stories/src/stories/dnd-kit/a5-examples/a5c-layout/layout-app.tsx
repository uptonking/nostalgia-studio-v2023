import React from 'react';

import { Layout } from './page';
import { Pages } from './pages';

export const Horizontal = () => <Pages layout={Layout.Horizontal} />;

export const Vertical = () => <Pages layout={Layout.Vertical} />;

export const Grid = () => <Pages layout={Layout.Grid} />;
