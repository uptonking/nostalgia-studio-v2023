import type React from 'react';
import { useEffect } from 'react';

export const useClickOutside = (
  ref: React.MutableRefObject<HTMLElement>,
  callback: (...args: unknown[]) => unknown,
) => {
  useEffect(() => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        // console.log(';; click-out-cb ');
        callback();
        // oneoff
        document.removeEventListener('click', handleClick);
      }
    };

    // console.log(';; click-out-register ');
    if (ref.current) {
      document.addEventListener('click', handleClick);
    }
    return () => {
      document.removeEventListener('click', handleClick);
    };
  });
};
