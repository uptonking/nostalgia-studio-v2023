import { useMemo } from 'react';

import type { UniqueIdentifier } from '../../../types';

let key = 0;

/** auto-generate increasing number as key */
export function useKey(id: UniqueIdentifier | undefined) {
  return useMemo(() => {
    if (id == null) {
      return;
    }

    key++;
    return key;
  }, [id]);
}
