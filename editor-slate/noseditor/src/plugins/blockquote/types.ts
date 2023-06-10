import { type Descendant } from 'slate';

export type BlockquoteType = 'blockquote';

export type BlockquoteElement = {
  id: string;
  type: BlockquoteType;
  children: Descendant[];
};
