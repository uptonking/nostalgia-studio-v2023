import { Element } from 'slate';

import { type DividerElement, type DividerType } from './types';

export const DividerSpec: DividerType = 'hr';

export const isDividerElement = (value: any): value is DividerElement => {
  return Element.isElementType<DividerElement>(value, DividerSpec);
};
