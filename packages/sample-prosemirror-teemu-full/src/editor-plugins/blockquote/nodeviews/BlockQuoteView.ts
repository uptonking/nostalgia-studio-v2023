import { Node as PMNode } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';

import { PluginsProvider } from '../../../core';
import { ReactNodeView } from '../../../react/ReactNodeView';
import { PortalProvider } from '../../../react/portals';
import { BlockQuote } from '../ui/BlockQuote';
import { BlockQuoteOptions, IBlockQuoteAttrs, IViewProps } from '..';

export class BlockQuoteView extends ReactNodeView<
  IViewProps,
  IBlockQuoteAttrs
> {
  createContentDOM() {
    const contentDOM = document.createElement('div');
    contentDOM.classList.add(`${this.node.type.name}__content-dom`);
    return contentDOM;
  }
}

export function blockQuoteNodeView(
  portalProvider: PortalProvider,
  pluginsProvider: PluginsProvider,
  options?: BlockQuoteOptions,
) {
  return (
    node: PMNode,
    view: EditorView,
    getPos: (() => number) | boolean,
  ): NodeView =>
    new BlockQuoteView(
      node,
      view,
      getPos,
      portalProvider,
      pluginsProvider,
      {
        options,
      },
      // 对应的react组件
      BlockQuote,
    ).init();
}
