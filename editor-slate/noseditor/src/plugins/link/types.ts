import { Descendant } from 'slate';

import type { LinkSpec } from './utils';

export type LinkType = 'a';

export type LinkElement = {
  type: LinkType;
  url: string;
  children: Descendant[];
};
