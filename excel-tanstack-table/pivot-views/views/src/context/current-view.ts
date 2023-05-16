import React from 'react';

import type { View } from '@datalking/pivot-core';

export const CurrentViewContext = React.createContext<View | null>(null);
