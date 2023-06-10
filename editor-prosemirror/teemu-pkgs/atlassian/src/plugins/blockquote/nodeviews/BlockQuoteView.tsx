import React from 'react';
import { type NodeView, type EditorView } from 'prosemirror-view';
import { type Node as PMNode } from 'prosemirror-model';

import { type PortalProviderAPI } from '../../../react-portals';
import {
  type EventDispatcher,
  createDispatch,
} from '../../../utils/event-dispatcher';
import {
  ReactNodeView,
  type ForwardRef,
  type getPosHandler,
} from '../../../nodeviews/ReactNodeView';

import { BlockQuote } from '../ui/BlockQuote';

import { type BlockQuoteOptions } from '../';

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
