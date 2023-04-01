import React, { useMemo } from 'react';

import { styled } from '@linaria/react';

import { ParagraphBase } from '../../../components';
import { type TextAlignValueType } from '../../../utils';
import type { ElementProps } from '../../types';
import type { ParagraphElement } from '../types';

type TextAlignCssValue = 'start' | 'center' | 'end' | 'justify';

export const Paragraph = (
  props: ElementProps & { element: ParagraphElement },
) => {
  const { children, attributes, element } = props;
  const align = useMemo(
    () => getTextAlignCssValue(element.textAlign),
    [element.textAlign],
  );

  return (
    <StyledParagraph
      {...attributes}
      align={align}
      className={align ? 'pAlign' : ''}
    >
      {children}
    </StyledParagraph>
  );
};

export const StyledParagraph = styled(ParagraphBase)<{
  align: TextAlignCssValue | '';
}>`
  &.pAlign {
    text-align: ${({ align }) => align};
  }
`;

function getTextAlignCssValue(prop: TextAlignValueType) {
  switch (prop) {
    // case 'alignLeft':
    //   return 'start';
    case 'alignCenter':
      return 'center';
    case 'alignRight':
      return 'end';
    case 'alignJustify':
      return 'justify';
    default:
      return '';
  }
}
