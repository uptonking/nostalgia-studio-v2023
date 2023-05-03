import React from 'react';

import cx from 'clsx';

import { css } from '@linaria/core';

import { themed } from '../../styles';

type ParagraphBaseProps = {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
} & React.HTMLProps<HTMLParagraphElement>;

export const ParagraphBase = (props_: ParagraphBaseProps) => {
  const { className, children, ...props } = props_;

  return (
    <p className={cx(pCss, className)} {...props}>
      {children}
    </p>
  );
};

const pCss = css`
  line-height: ${themed.font.family.lineHeight.default};
`;
