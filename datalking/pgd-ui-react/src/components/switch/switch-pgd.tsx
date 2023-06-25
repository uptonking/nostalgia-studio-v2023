import React from 'react';

import {
  createComponent,
  createElement,
} from '@ariakit/react-core/utils/system';
import { css } from '@linaria/core';

import {
  type SwitchOptions,
  type SwitchProps as SwitchPropsCore,
  SwitchUnstyled,
  useSwitch,
} from './switch';

export type SwitchProps = SwitchPropsCore & {
  /** alias for `endText`. it will overwrite `endText` if both exists. */
  children?: React.ReactNode;
  /** this text will show before switch */
  startText?: React.ReactNode;
  /** this text will show after switch */
  endText?: React.ReactNode;
};

/**
 * styled switch component.
 * - use `SwitchUnstyled` to get more control.
 */
export const Switch = (props: SwitchProps) => {
  const { startText, children, endText, ...props_ } = props;
  let { endText: rightText } = props;
  if (children) {
    rightText = children;
  }

  const htmlProps = useSwitch(props_);

  if (!startText && !endText && !children) {
    return createElement('input', htmlProps);
  }

  return (
    <label className={rootCss}>
      {startText}
      {createElement('input', htmlProps)}
      {rightText}
    </label>
  );
};

if (process.env.NODE_ENV !== 'production') {
  Switch['displayName'] = 'Switch';
}

export const rootCss = css`
  /* the length of switch */
  --track-size: calc(var(--thumb-size) * 2);
  --track-padding: 2px;
  --track-inactive: hsl(80 0% 80%);
  --track-active: hsl(80 60% 45%);
  --track-color-inactive: var(--track-inactive);
  --track-color-active: var(--track-active);

  /* the size of on/off */
  --thumb-size: 2rem;
  --thumb: hsl(0 0% 100%);
  --thumb-highlight: hsl(0 0% 0% / 25%);
  --thumb-color: var(--thumb);
  --thumb-color-highlight: var(--thumb-highlight);

  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: 1.5rem;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  & > input {
    --thumb-position: 0%;
    --thumb-transition-duration: 0.25s;

    /* removes the visual checkmark supplied by the browser.  */
    appearance: none;
    position: relative;

    inline-size: var(--track-size);
    block-size: var(--thumb-size);
    padding: var(--track-padding);
    border: none;
    border-radius: var(--track-size);
    outline-offset: 5px;
    background: var(--track-color-inactive);
  }

  & > input::before {
    content: '';
    position: absolute;
    inline-size: calc(var(--thumb-size) * 0.9);
    block-size: calc(var(--thumb-size) * 0.9);
    border-radius: 50%;
    box-shadow: 0 0 0 var(--highlight-size) var(--thumb-color-highlight);
    transform: translateX(var(--thumb-position));
    transition: transform var(--thumb-transition-duration) ease,
      box-shadow 0.25s ease;
    background: var(--thumb-color);
  }

  & > input:checked {
    --thumb-position: calc(var(--track-size) - 115%);
    /* --thumb-position: calc((var(--track-size) - 100%) * var(--isLTR)); */
    background: var(--track-color-active);
  }

  & > input:disabled {
    cursor: not-allowed;
    --thumb-color: transparent;

    &::before {
      cursor: not-allowed;
      box-shadow: inset 0 0 0 2px hsl(0 0% 100% / 50%);

      /* @media (prefers-color-scheme: dark) {
        & {
          box-shadow: inset 0 0 0 2px hsl(0 0% 0% / 50%);
        }
      } */
    }
  }
`;
