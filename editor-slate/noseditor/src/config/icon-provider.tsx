import * as React from 'react';

import { DEFAULT_ICON_CONFIGS, Home, IconProvider } from '@icon-park/react';

const IconConfig = { ...DEFAULT_ICON_CONFIGS, prefix: 'icon', strokeWidth: 2 };

export function NosIconProvider({ children }) {
  return <IconProvider value={IconConfig}>{children}</IconProvider>;
}
