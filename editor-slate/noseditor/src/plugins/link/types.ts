import { Descendant } from 'slate';

import type { LinkSpec } from './utils';

export type LinkType = 'a';

export type LinkElementType = {
  type: LinkType;
  url: string;
  children: Descendant[];
};
