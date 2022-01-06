import { Node as PMNode } from 'prosemirror-model';
import { EditorView, NodeView } from 'prosemirror-view';
import React from 'react';

import {
  ForwardRef,
  ReactNodeView,
  getPosHandler,
} from '../../../nodeviews/ReactNodeView';
import { PortalProviderAPI } from '../../../react-portals';
import { EventDispatcher } from '../../../utils/event-dispatcher';
import { BlockQuoteOptions } from '../';
import { BlockQuote } from '../ui/BlockQuote';

export interface IProps {
  // providerFactory: ProviderFactory;
  options?: BlockQuoteOptions;
}

export class BlockQuoteView extends ReactNodeView<IProps> {
  getContentDOM() {
    const dom = document.createElement('div');
    dom.classList.add(`${this.node.type.name}-dom-wrapper`);
    return {
      dom,
    };
  }

  /** render方法被覆盖了 */
  render(_props: {}, forwardRef: ForwardRef) {
    return <BlockQuote ref={forwardRef} />;
  }
}

export function blockQuoteNodeView(
  portalProviderAPI: PortalProviderAPI,
  eventDispatcher: EventDispatcher,
  // providerFactory: ProviderFactory,
  options?: BlockQuoteOptions,
) {
  return (node: PMNode, view: EditorView, getPos: getPosHandler): NodeView =>
    new BlockQuoteView(node, view, getPos, portalProviderAPI, eventDispatcher, {
      // providerFactory,
      options,
    }).init();
}
