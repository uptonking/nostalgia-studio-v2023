import { Descendant } from 'slate';

export type LinkType = 'link';

export type LinkElementType = {
  type: LinkType;
  url: string;
  children: Descendant[];
};
