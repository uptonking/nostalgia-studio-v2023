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

const anchorElemCss = css`
  display: grid;
  place-items: center;
  width: 200px;
  height: 64px;
  background: seashell;
`;

const hoverElemCss = css`
  background: lightblue;
  width: 160px;
  height: 40px;
`;

export function A1b1Hover() {
  const [isOpen, setIsOpen] = useState(false);

  const { x, y, strategy, refs, context } = useFloating({
    open: isOpen,
    onOpenChange: setIsOpen,
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

  console.log(';; isHoverOpen ', isOpen, x, y, refs, context);

  return (
    <div className='App'>
      <div
        className={anchorElemCss}
        ref={refs.setReference}
        {...getReferenceProps()}
      >
        Reference element
      </div>
      {isOpen && (
        <div
          className={hoverElemCss}
          ref={refs.setFloating}
          style={{
            position: strategy,
            top: y ?? 0,
            left: x ?? 0,
          }}
          {...getFloatingProps()}
        >
          Floating element
        </div>
      )}
    </div>
  );
}
