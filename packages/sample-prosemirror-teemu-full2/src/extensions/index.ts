import { BaseExtension, baseSchema } from './base';
import type { BaseExtensionProps } from './base';
import { BlockQuoteExtension, blockQuoteSchema } from './blockquote';
import type { BlockQuoteExtensionProps } from './blockquote';
import { CollabExtension } from './collab';
import type { CollabExtensionProps } from './collab';
import { createReactExtension } from './createReactExtension';
import { createSchemaFromSpecs } from './createSchema';

/** 定义了编辑器最基本的doc/text/plugins/keys/undo-redo，是无dom元素的容器组件 */
export const Base = createReactExtension<BaseExtensionProps>(BaseExtension);

/** 定义blockquote扩展，包含所有相关插件，使用react组件作为NodeView */
export const BlockQuote =
  createReactExtension<BlockQuoteExtensionProps>(BlockQuoteExtension);

export const Collab =
  createReactExtension<CollabExtensionProps>(CollabExtension);

export { BaseExtension } from './base';
export type { BaseState } from './base';
export { BlockQuoteExtension } from './blockquote';
export type { BlockQuoteState } from './blockquote';
export { CollabExtension } from './collab';
export type { CollabState } from './collab';

export { Extension } from './Extension';

export const createDefaultSchema = () =>
  createSchemaFromSpecs([baseSchema, blockQuoteSchema]);
export { createSchema } from './createSchema';
export { createPlugins } from './createPlugins';
