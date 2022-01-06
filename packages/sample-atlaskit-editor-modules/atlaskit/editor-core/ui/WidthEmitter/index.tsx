import { EditorView } from 'prosemirror-view';
import * as React from 'react';
import { useEffect } from 'react';

import type { WidthConsumerContext } from '../../../editor-common';
import { WidthConsumer, useWidthContext } from '../../../editor-common';
import { pluginKey as widthPluginKey } from '../../plugins/width';
import type { ContextPanelContext } from '../ContextPanel/context';
import {
  ContextPanelConsumer,
  useContextPanelContext,
} from '../ContextPanel/context';

export interface Props {
  editorView?: EditorView;
}

type CallbacksType = {
  setContextPanelWidth: React.Dispatch<React.SetStateAction<number>>;
  setContainerWidth: React.Dispatch<React.SetStateAction<number>>;
};

type CallbacksReturn = [
  (props: ContextPanelContext) => null,
  (props: WidthConsumerContext) => null,
];

/** 简单地用useCallback封装参数传入的2个setState方法 */
function useCreateWidthCallbacks({
  setContextPanelWidth,
  setContainerWidth,
}: CallbacksType): CallbacksReturn {
  const contextPanelWidthCallback = React.useCallback(
    ({ width }: ContextPanelContext) => {
      setContextPanelWidth(width);
      return null;
    },
    [setContextPanelWidth],
  );

  const containerWidthCallback = React.useCallback(
    ({ width }: WidthConsumerContext) => {
      setContainerWidth(width);
      return null;
    },
    [setContainerWidth],
  );

  return [contextPanelWidthCallback, containerWidthCallback];
}

/**
 * 纯容器组件，与渲染dom无关。
 * 会从context中获取contextPanelWidth和containerWidth，context更新时通知WidthPlugin。
 * ~~本组件写法存在问题，render方法的return部分里面直接调用了setState.~~
 */
function WidthEmitter({ editorView }: Props) {
  const [contextPanelWidth, setContextPanelWidth] = React.useState(0);
  const [containerWidth, setContainerWidth] = React.useState(0);

  // const [contextPanelWidthCallback, containerWidthCallback] =
  //   useCreateWidthCallbacks({ setContextPanelWidth, setContainerWidth });

  const { width: contextPanelCtxValWidth } = useContextPanelContext();
  const { width: widthCtxValWidth } = useWidthContext();

  useEffect(() => {
    setContextPanelWidth(contextPanelCtxValWidth);
    setContainerWidth(widthCtxValWidth);
  }, [contextPanelCtxValWidth, widthCtxValWidth]);

  useEffect(() => {
    const width = containerWidth - contextPanelWidth;
    if (width <= 0 || isNaN(width) || !editorView) {
      return;
    }

    const {
      dom,
      state: { tr },
      dispatch,
    } = editorView;

    tr.setMeta(widthPluginKey, {
      width,
      containerWidth,
      lineLength: dom ? dom.clientWidth : undefined,
    });

    dispatch(tr);

    return () => {};
  }, [editorView, contextPanelWidth, containerWidth]);

  return null;

  // 在渲染本组件时，又更新了本组件
  // return (
  //   <>
  //     <ContextPanelConsumer>{contextPanelWidthCallback}</ContextPanelConsumer>
  //     <WidthConsumer>{containerWidthCallback}</WidthConsumer>
  //   </>
  // );
}

export default WidthEmitter;
