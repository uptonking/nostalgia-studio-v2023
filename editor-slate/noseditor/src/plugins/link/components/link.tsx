import React, { useState } from 'react';

import { css } from '@linaria/core';

import {
  PopoverContent,
  PopoverProvider,
  PopoverTrigger,
} from '../../../components/common/popover';
import { themed } from '../../../styles/theme-vars';
import type { ElementProps } from '../../types';
import type { LinkElement } from '../types';
import { LinkInput } from './link-input';

export const Link = (props: ElementProps & { element: LinkElement }) => {
  const { attributes, children, element } = props;
  const { url } = element;

  const [isOpen, setIsOpen] = useState(false);

  return (
    <PopoverProvider
      open={isOpen}
      onOpenChange={setIsOpen}
      placement='bottom-start'
    >
      <PopoverTrigger
        asChild={true}
        onClick={() => setIsOpen((v) => !v)}
        onMouseEnter={() => {
          if (!isOpen) setIsOpen(true);
        }}
      // onMouseLeave={() => {
      //   if (isOpen) setIsOpen(false);
      // }}
      >
        <a
          className={anchorElemCss}
          {
          // note: attributes.ref.current=null, it must be put before ref prop
          ...attributes
          }
          // onClick: (e) => {
          //   const linkElement = e.currentTarget;
          //   if (linkElement) {
          //     e.preventDefault();
          //     const href = linkElement['href'];
          //     window.open(href, '_blank');
          //   }
          // }
          href={url}
        >
          <InlineChromiumBugfix />
          {children}
          <InlineChromiumBugfix />
        </a>
      </PopoverTrigger>
      <PopoverContent closeOnMouseLeave={true}>
        <LinkInput link={url} />
      </PopoverContent>
    </PopoverProvider>
  );
};

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
// copied from slate inlines examples
const InlineChromiumBugfix = () => (
  <span contentEditable={false} className={'clipboardSkip ' + chromiumFixCss}>
    ${String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const chromiumFixCss = css`
  font-size: 0;
  line-height: 1;
`;

const anchorElemCss = css`
  margin: 0 1px;
  color: ${themed.color.text.link};
  text-decoration: none;
  cursor: pointer;
`;
