import React, { useEffect, useReducer, useState } from 'react';

import { useEditorContext } from '../../context';

/**
 * 这里提供了一个强制刷新所有ReactNodeViews组件的方法。
 * 只要portalProvider的this.portals发生变化，就会rerender所有代表portals的react elements；
 * 但进一步分析，this.portals始终不会变化，因为自身是集合，使用set/delete操作时，对象引用自身不会变化；
 * Component to render the mounted nodeViews as portals.
 *
 * This allows them to share React context and it is a lot faster than using plain old ReactDOM.render
 * and unmountComponentAtNode. Previously I had a performance bottleneck with creating multiple nodeviews
 * at once with every update causing this PortalRenderer to re-render. Collecting those operations and running
 * a single flush function per updateState fixed this problem to large extent. This is, as far as I know, still
 * a problem in the original Atlassian editor so maybe they'll notice the same thing some day too.
 *
 * I discuss this here:
 * https://discuss.prosemirror.net/t/a-modified-version-of-atlassians-react-typescript-pm-editor/3441
 */
export function PortalRenderer() {
  const { portalProvider } = useEditorContext();
  const [, forceUpdate] = useReducer((x) => x + 1, 0);

  const [portals, setPortals] = useState<Map<HTMLElement, React.ReactPortal>>(
    new Map(),
  );

  useEffect(() => {
    // 会传入所有代表portals的react elements到onUpdatePortals()方法
    portalProvider.addPortalRendererCallback(onUpdatePortals);
  }, []);

  const onUpdatePortals = (newPortals: Map<HTMLElement, React.ReactPortal>) => {
    setPortals(newPortals);
    // 不管newPortals变了没有，都会强制rerender这个react组件，然后触发所有ReactNodeViews组件
    forceUpdate();
  };

  return (
    <>{Array.from(portals.entries()).map(([container, portal]) => portal)}</>
  );
}
