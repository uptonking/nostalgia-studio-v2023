import { BlockContent, LayoutColumnDefinition } from '../../../adf-schema';

export const layoutColumn =
  (attrs: { width: number }) =>
  (content: BlockContent[]): LayoutColumnDefinition => ({
    type: 'layoutColumn',
    attrs,
    content,
  });
