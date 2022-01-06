import { useEffect, useState } from 'react';

import { PortalProvider } from '../portals/PortalProvider';

/** 高阶方法，返回一个函数，将 <container, cb> 保存到 portalProvider的nodeViewListeners */
export function createListenProps<A>(
  container: HTMLElement,
  portalProvider: PortalProvider,
) {
  return function (cb: (newProps: A) => void) {
    useEffect(() => {
      //
      portalProvider.subscribe(container, cb);
      return () => {
        portalProvider.unsubscribe(container, cb);
      };
    }, []);
  };
}
