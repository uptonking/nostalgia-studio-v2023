import React from 'react';

import cx from 'clsx';

import { css } from '@linaria/core';

import { themed } from '../../../../src/styles';
import { type ElementProps } from '../../types';
import {
  type Heading1Element,
  type Heading2Element,
  type Heading3Element,
} from '../types';

export const Heading1 = (
  props: ElementProps & { element: Heading1Element },
) => {
  const { children, attributes } = props;

  return (
    <h1 className={cx('nos-elem', headingsCss, h1Css)} {...attributes}>
      {children}
    </h1>
  );
};

export const Heading2 = (
  props: ElementProps & { element: Heading2Element },
) => {
  const { children, attributes } = props;

  return (
    <h2 className={cx('nos-elem', headingsCss, h2Css)} {...attributes}>
      {children}
    </h2>
  );
};

export const Heading3 = (
  props: ElementProps & { element: Heading3Element },
) => {
  const { children, attributes } = props;

  return (
    <h3 className={cx('nos-elem', headingsCss, h3Css)} {...attributes}>
      {children}
    </h3>
  );
};

const headingsCss = css`
  margin-top: ${themed.spacing.spacer.xs};
  margin-bottom: ${themed.spacing.spacer.xs};
`;
const h1Css = css`
  line-height: 40px;
`;
const h2Css = css`
  line-height: 35px;
`;
const h3Css = css`
  line-height: 30px;
`;
