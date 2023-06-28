import React, { useMemo } from 'react';

import cx from 'clsx';

import { Heading } from '@ariakit/react-core/heading/heading';
import { HeadingLevel } from '@ariakit/react-core/heading/heading-level';
import { css } from '@linaria/core';
import { themed } from '@pgd/ui-tokens';

type CreateHeadingOptions = {
  type?: 'h1' | 'h2' | 'h3' | 'h4';
};

type HeadingProps = {
  children?: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
};

function getHeadingStyle(type: CreateHeadingOptions['type'] = 'h1') {
  const tryGetStyle = headingStylesMap[type];
  if (!tryGetStyle) return headingStylesMap['h1'];
  return tryGetStyle;
}

function createHeading({ type = 'h1' }: CreateHeadingOptions = {}) {
  return ({ children, className, style }: HeadingProps = {}) => {
    const hStyle = useMemo(() => getHeadingStyle(type), []);
    return (
      <Heading className={cx(hStyle, className)} style={style}>
        {children || ' '}
      </Heading>
    );
  };
}

export const Heading1 = createHeading();
export const Heading2 = createHeading({ type: 'h2' });
export const Heading3 = createHeading({ type: 'h3' });
export const Heading4 = createHeading({ type: 'h4' });

export { HeadingLevel, Heading };

export const h1Css = css`
  font-size: ${themed.font.size.xl4};
  font-weight: 600;
  line-height: ${themed.size.lineHeight.rem.n10};
`;

export const h2Css = css`
  font-size: ${themed.font.size.xl3};
  font-weight: 600;
  line-height: ${themed.size.lineHeight.rem.n9};
`;

export const h3Css = css`
  font-size: ${themed.font.size.xl2};
  line-height: ${themed.size.lineHeight.rem.n8};
`;

export const h4Css = css`
  font-size: ${themed.font.size.xl};
  line-height: ${themed.size.lineHeight.rem.n7};
`;

export const headingStylesMap = { h1: h1Css, h2: h2Css, h3: h3Css, h4: h4Css };
