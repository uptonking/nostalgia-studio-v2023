import { Element } from 'slate';

import type {
  Heading1Element,
  Heading1Type,
  Heading2Element,
  Heading2Type,
  Heading3Element,
  Heading3Type,
} from './types';

export const Heading1Spec: Heading1Type = 'h1';
export const Heading2Spec: Heading2Type = 'h2';
export const Heading3Spec: Heading3Type = 'h3';


export const isHeading1Element = (value: any): value is Heading1Element => {
  return Element.isElementType<Heading1Element>(value, Heading1Spec);
};

export const isHeading2Element = (value: any): value is Heading2Element => {
  return Element.isElementType<Heading2Element>(value, Heading2Spec);
};

export const isHeading3Element = (value: any): value is Heading3Element => {
  return Element.isElementType<Heading3Element>(value, Heading3Spec);
};

export const isHeadingElement = (
  value: any,
): value is Heading1Element | Heading2Element | Heading3Element => {
  return (
    isHeading1Element(value) ||
    isHeading2Element(value) ||
    isHeading3Element(value)
  );
};
