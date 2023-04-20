import { Element } from 'slate';

import type { ParagraphElement, ParagraphType } from './types';

export const ParagraphSpec: ParagraphType = 'p';

export const isParagraphElement = (value: any): value is ParagraphElement => {
  return Element.isElementType<ParagraphElement>(value, ParagraphSpec);
};

export const createParagraphElement = (value?: string): ParagraphElement => {
  const pElem: ParagraphElement = {
    type: ParagraphSpec,
    children: [{ text: value ?? '' }],
  };
  return pElem;
};
