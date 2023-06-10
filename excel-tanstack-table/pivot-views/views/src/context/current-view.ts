import React from 'react';

import { type View } from '@datalking/pivot-core';

/**
 * todo refactor out of react
 */
export const CurrentViewContext = React.createContext<View | null>(null);
