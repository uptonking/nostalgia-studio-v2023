import React from 'react';

import {
  createComponent,
  createElement,
} from '@ariakit/react-core/utils/system';
import { css } from '@linaria/core';
import { themed } from '@pgd/ui-tokens';

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
 * - if you want more control, use `SwitchUnstyled`.
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
  display: flex;
  justify-content: flex-start;
  align-items: center;
  gap: ${themed.spacing.rem.n6};
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;

  & > input {
    /* default-width of switch is 4rem; default-width of on/off is 2rem */
    /* removes the visual checkmark supplied by the browser */
    appearance: none;
    position: relative;

    inline-size: ${themed.spacing.rem.n16};
    block-size: ${themed.spacing.rem.n8};
    padding: ${themed.spacing.rem.n0half};
    border: none;
    border-radius: ${themed.spacing.rem.n16};
    outline-offset: ${themed.border.outlineOffset.n4};
    background: ${themed.palette.gray300};
    cursor: pointer;
  }

  & > input::before {
    content: '';
    position: absolute;
    inline-size: calc(${themed.spacing.rem.n8} * 0.9);
    block-size: calc(${themed.spacing.rem.n8} * 0.9);
    border-radius: 50%;
    transform: translateX(0);
    transition:
      transform ${themed.transition.period.n200} ease,
      box-shadow ${themed.transition.period.n200} ease;
    background-color: ${themed.palette.white};
  }

  & > input:checked {
    background: ${themed.palette.blue500};

    &::before {
      transform: translateX(
        calc(${themed.spacing.rem.n16} - ${themed.spacing.rem.n8})
      );
    }
  }

  & > input:disabled {
    cursor: not-allowed;

    &::before {
      cursor: not-allowed;
      /* box-shadow: inset ${themed.shadow.sm}; */
      box-shadow: inset 0 0 0 2px rgba(255, 255, 255, 0.5);
      background-color: transparent;
    }
  }
`;
