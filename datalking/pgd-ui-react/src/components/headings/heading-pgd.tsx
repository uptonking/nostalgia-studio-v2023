import React from 'react';

import { Heading } from '@ariakit/react-core/heading/heading';
import { HeadingLevel } from '@ariakit/react-core/heading/heading-level';
import { css } from '@linaria/core';

type CreateHeadingOptions = {
  type?: 'h1' | 'h2' | 'h3' | 'h4';
};

function createHeading({ type = 'h1' }: CreateHeadingOptions = {}) {
  return ({ title }: { title?: string } = {}) => {
    switch (type) {
      case 'h2':
        return (
          <HeadingLevel>
            <HeadingLevel>
              <Heading>{title || ' '}</Heading>
            </HeadingLevel>
          </HeadingLevel>
        );
      case 'h3':
        return (
          <HeadingLevel>
            <HeadingLevel>
              <HeadingLevel>
                <Heading>{title || ' '}</Heading>
              </HeadingLevel>
            </HeadingLevel>
          </HeadingLevel>
        );
      case 'h4':
        return (
          <HeadingLevel>
            <HeadingLevel>
              <HeadingLevel>
                <HeadingLevel>
                  <Heading>{title || ' '}</Heading>
                </HeadingLevel>
              </HeadingLevel>
            </HeadingLevel>
          </HeadingLevel>
        );
      default:
        return (
          <HeadingLevel>
            <Heading>{title || ' '}</Heading>
          </HeadingLevel>
        );
    }
  };
}

export const Heading1 = createHeading();
export const Heading2 = createHeading({ type: 'h2' });
export const Heading3 = createHeading({ type: 'h3' });
export const Heading4 = createHeading({ type: 'h4' });

export const h1Css = css`
`;
