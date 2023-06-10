import { Element } from 'slate';

import { type ImageElement, type ImageType } from './types';

export const ImageSpec: ImageType = 'image';

export const isImageElement = (value: any): value is ImageElement => {
  return Element.isElementType<ImageElement>(value, ImageSpec);
};

export const createImageNode = (
  props: Omit<ImageElement, 'type' | 'children'>,
): ImageElement => {
  return {
    type: 'image',
    children: [{ text: '' }],
    ...props,
  };
};
