import React from 'react';

import cx from 'clsx';

import { css } from '@linaria/core';

import { themed } from '../../../../src/styles';
import { type ElementProps } from '../../types';
import { type BlockquoteElement } from '../types';

export const Blockquote = (
  props: ElementProps & { element: BlockquoteElement },
) => {
  const { children, attributes } = props;

  return (
    <blockquote className={cx('nos-elem', rootContainerCss)} {...attributes}>
      {children}
    </blockquote>
  );
};

const rootContainerCss = css`
  color: ${themed.color.text.muted};
  margin-left: ${themed.spacing.spacer.lg};
`;
