import { Descendant } from 'slate';

import type { TextAlignValueType } from '../../utils';

export type ParagraphType = 'p';

export type ParagraphElement = {
  // id: string;
  type: ParagraphType;
  textAlign?:TextAlignValueType;
  children: Descendant[];
};
