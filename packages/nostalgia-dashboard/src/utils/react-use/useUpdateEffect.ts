import { useEffect } from 'react';

import { useFirstMountState } from './useFirstMountState';

/**
 * ignores the first invocation (e.g. on mount).
 * The signature is exactly the same as the `useEffect` hook.
 */
export const useUpdateEffect: typeof useEffect = (effect, deps) => {
  const isFirstMount = useFirstMountState();

  useEffect(() => {
    if (!isFirstMount) {
      return effect();
    }
  }, deps);
};

export default useUpdateEffect;
