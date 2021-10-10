import { useRef } from 'react';

/**
 * Returns `true` if component is just mounted (on first render) and `false` otherwise.
 */
export function useFirstMountState(): boolean {
  const isFirst = useRef(true);

  if (isFirst.current) {
    isFirst.current = false;

    return true;
  }

  return isFirst.current;
}

export default useFirstMountState;
