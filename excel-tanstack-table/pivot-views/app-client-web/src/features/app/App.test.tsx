import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';

import { config } from '../../shared/config';
import { App } from './App';

describe('App', () => {
  test('Root render', async () => {
    const { findAllByRole } = render(<App />);
    await waitFor(() => findAllByRole('progressbar'));
    const appLinks = screen.getAllByText(config.defaultTitle);
    expect(appLinks.length).toBeGreaterThan(0);
  });
});
