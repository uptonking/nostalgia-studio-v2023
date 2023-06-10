import { type ContextType, useContext } from 'react';

import { PublicContext } from '../store';

/** get `PublicContext` value */
export function useDndContext() {
  return useContext(PublicContext);
}

export type UseDndContextReturnValue = ContextType<typeof PublicContext>;
