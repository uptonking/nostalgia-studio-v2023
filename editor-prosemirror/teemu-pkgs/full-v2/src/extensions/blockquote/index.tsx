import { type NodeViewProps } from '../../react';

export interface BlockQuoteOptions {}
export interface IViewProps {
  options?: BlockQuoteOptions;
}
export type UIProps = NodeViewProps<IViewProps, IBlockQuoteAttrs>;
export interface IBlockQuoteAttrs {
  size: number;
}

export { blockquotePluginKey } from './pm-plugins/state';
export type { BlockQuoteState } from './pm-plugins/state';
export { BlockQuoteExtension } from './BlockQuoteExtension';
export type { BlockQuoteExtensionProps } from './BlockQuoteExtension';
export { blockQuoteSchema } from './nodes/blockquote';
