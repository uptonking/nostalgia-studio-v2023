import { Descendant, Element } from 'slate';

import type { LinkElementType, LinkType } from './types';

export const LinkSpec: LinkType = 'link';

type CreateLinkProps = {
  url: string;
  text?: string;
  children?: Descendant[];
};

export const createLinkElement = ({
  url,
  text,
  children = [],
}: CreateLinkProps): LinkElementType => {
  if (text) {
    children = [{ text }];
  }

  return { type: LinkSpec, url, children };
};

export const isLinkElement = (value: any): value is LinkElementType => {
  return Element.isElementType<LinkElementType>(value, LinkSpec);
};
