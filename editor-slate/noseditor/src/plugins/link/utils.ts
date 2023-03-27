import { Descendant, Element } from 'slate';

import type { LinkElement, LinkType } from './types';

export const LinkSpec: LinkType = 'a';

type CreateLinkArgs = {
  url: string;
  text?: string;
  children?: Descendant[];
};

export const createLinkElement = ({
  url,
  text,
  children = [],
}: CreateLinkArgs): LinkElement => {
  if (text) {
    children = [{ text }];
  }

  return { type: LinkSpec, url, children };
};

export const isLinkElement = (value: any): value is LinkElement => {
  return Element.isElementType<LinkElement>(value, LinkSpec);
};
