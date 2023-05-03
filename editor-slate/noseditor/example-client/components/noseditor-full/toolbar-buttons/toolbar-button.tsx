import React from 'react';

import cx from 'clsx';

import { css } from '@linaria/core';

import { IconButton, type IconButtonProps } from '../../../../src/components';
import { themed } from '../../../../src/styles';

export const ToolbarBtnActiveClassName = 'isToolbarBtnActive';

export const ToolbarButton = (props_: IconButtonProps) => {
  const { className, children, ...props } = props_;
  return (
    <IconButton className={cx(className, actionBtnCss)} {...props}>
      {children}
    </IconButton>
  );
};

const actionBtnCss = css`
  ${'&.' + ToolbarBtnActiveClassName} {
    background-color: ${themed.color.brand.lighter};
  }
`;
