import {
  BlockContent,
  DocNode,
  LayoutSectionDefinition,
} from '../../../adf-schema';

export const doc = (
  ...content: Array<BlockContent | LayoutSectionDefinition>
): DocNode => ({
  type: 'doc',
  version: 1,
  content,
});
