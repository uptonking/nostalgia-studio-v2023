import type { Descendant } from 'slate';

export type ImageType = 'image';

export type ImageElement = {
  type: ImageType;
  url: string;
  alt?: string;
  width?: string;
  height?: string;
  children: Descendant[];
};
