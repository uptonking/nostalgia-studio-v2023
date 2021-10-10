import { useCallback, useEffect, useRef } from 'react';

/**
 * designed to be used to avoid state updates on unmounted components.
 * 基于useRef实现，所以不会触发rerender。
 */
export function useMountedState(): () => boolean {
  const mountedRef = useRef<boolean>(false);
  const get = useCallback(() => mountedRef.current, []);

  useEffect(() => {
    mountedRef.current = true;

    return () => {
      mountedRef.current = false;
    };
  }, []);

  return get;
}

export default useMountedState;
