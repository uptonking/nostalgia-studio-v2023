import React, { useState } from 'react';

import {
  autoPlacement,
  autoUpdate,
  offset,
  useFloating,
  useHover,
  useInteractions,
} from '@floating-ui/react';
import { css } from '@linaria/core';

import { themed } from '../../../styles/theme-vars';
import type { ElementProps } from '../../types';
import type { LinkElement } from '../types';

export const Link = (props: ElementProps & { element: LinkElement }) => {
  const { attributes, children, element } = props;
  const { url } = element;

  const [isVisible, setIsVisible] = useState(false);

  const { x, y, strategy, refs, context } = useFloating({
    open: isVisible,
    onOpenChange: setIsVisible,
    whileElementsMounted: autoUpdate,
    middleware: [
      offset(5),
      autoPlacement({
        autoAlignment: true,
        allowedPlacements: ['top', 'bottom'],
      }),
    ],
  });

  const hover = useHover(context);

  const { getReferenceProps, getFloatingProps } = useInteractions([hover]);

  console.log(';; isHoverOpen ', isVisible, x, y, refs, context);
  return (
    <>
      <a
        className={anchorElemCss}
        ref={refs.setReference}
        {...getReferenceProps()}
        {...attributes}
        href={url}
        onClick={(e) => {
          const linkElement = e.currentTarget;
          if (linkElement) {
            e.preventDefault();
            const href = linkElement.href;
            window.open(href, '_blank');
          }
        }}
      >
        <InlineChromiumBugfix />
        {children}
        <InlineChromiumBugfix />
      </a>

      {isVisible ? (
        <div
          ref={refs.setFloating}
          className={linkInputCss}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          {...getFloatingProps()}
        >
          Floating element
        </div>
      ) : null}
    </>
  );
};

// Put this at the start and end of an inline component to work around this Chromium bug:
// https://bugs.chromium.org/p/chromium/issues/detail?id=1249405
// copied from slate inlines examples
const InlineChromiumBugfix = () => (
  <span
    contentEditable={false}
    className='clipboardSkip'
    style={{ fontSize: 0, lineHeight: 1 }}
  >
    ${String.fromCodePoint(160) /* Non-breaking space */}
  </span>
);

const anchorElemCss = css`
  display: inline-block;
  margin: 0 2px;
  color: ${themed.color.text.link};
  text-decoration: none;
  cursor: pointer;
  width: 100px;
  height: 20px;
`;

const linkInputCss = css`
  background: lightblue;
  width: 160px;
  height: 40px;
`;
