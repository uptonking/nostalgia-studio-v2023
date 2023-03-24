import { Element } from 'slate';

import type { ParagraphElement, ParagraphType } from './types';

export const ParagraphSpec: ParagraphType = 'p';

export const isParagraphElement = (value: any): value is ParagraphElement => {
  return Element.isElementType<ParagraphElement>(value, ParagraphSpec);
};
