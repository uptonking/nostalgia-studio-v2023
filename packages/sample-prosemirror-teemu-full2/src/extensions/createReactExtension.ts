import { useEffect, useLayoutEffect, useMemo } from 'react';

import { EditorContext, useEditorContext } from '../context';
import { Extension } from './Extension';

/** 创建extension对象，并注册到extensionProvider，始终return null，是容器组件，
 * 每个extension对象都持有editorContext的value值
 */
export const createReactExtension =
  <T>(ExtClass: new (ctx: EditorContext, props: T) => Extension<T>) =>
  (props: T) => {
    const ctx = useEditorContext();
    const { extensionProvider } = ctx;

    const extension = useMemo(() => new ExtClass(ctx, props), [ctx, props]);

    useLayoutEffect(() => {
      extensionProvider.register(extension);
      return () => {
        extensionProvider.unregister(extension);
      };
    }, [extension, extensionProvider]);

    useEffect(() => {
      extension.onPropsChanged(props);
    }, [extension, props]);

    return null;
  };
