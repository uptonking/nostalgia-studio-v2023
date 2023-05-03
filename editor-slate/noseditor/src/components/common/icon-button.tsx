import React, { useEffect, useState } from 'react';

import cx from 'clsx';

import type { IIconProps } from '@icon-park/react/lib/runtime';
import { css } from '@linaria/core';

import { themed } from '../../styles';

export type IconButtonProps = {
  className?: string;
  style?: React.CSSProperties;
  children: React.ReactElement<IIconProps>;
  as?: React.ElementType;
  /** default tooltip text */
  title?: string;
} & Omit<React.HTMLProps<HTMLButtonElement>, 'type'>;

export const IconButton = (props_: IconButtonProps) => {
  const { children, className, ...props } = props_;
  return (
    <button type='button' className={cx(iconBtnCss, className)} {...props}>
      {children}
    </button>
  );
};

const iconBtnCss = css`
  width: 28px;
  height: 28px;
  padding-top: 4px;
  padding-bottom: 4px;
  border: 0;
  border-radius: 6px;
  background-color: transparent;
  color: ${themed.color.text.muted};
  cursor: pointer;
  &:hover {
    background-color: ${themed.color.background.hover};
  }
  &:focus-visible {
    outline-color: ${themed.color.border.muted};
  }
`;
