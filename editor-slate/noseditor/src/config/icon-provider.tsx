import * as React from 'react';

import { DEFAULT_ICON_CONFIGS, IconProvider } from '../components/icons';

const IconConfig = { ...DEFAULT_ICON_CONFIGS, prefix: 'icon', strokeWidth: 2 };

type NosIconProviderProps = {
  children: React.ReactNode;
};

export function NosIconProvider({ children }: NosIconProviderProps) {
  return <IconProvider value={IconConfig}>{children}</IconProvider>;
}
