import { createContext } from 'react';

import { type RegisterListener } from './types';

/** drag event listeners */
export const DndMonitorContext = createContext<RegisterListener | null>(null);
