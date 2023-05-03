import React, { useMemo } from 'react';

import { css } from '@linaria/core';

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

  const stylesMap = useMemo(() => getParagraphStylesMap(), []);

  return (
    <ParagraphBase {...attributes} className={align ? stylesMap[align] : ''}>
      {children}
    </ParagraphBase>
  );
};

function getParagraphStylesMap() {
  return {
    center: textAlignCenter,
    end: textAlignRight,
    justify: textAlignJustify,
  };
}

const textAlignRight = css`
  text-align: right;
`;
const textAlignCenter = css`
  text-align: center;
`;
const textAlignJustify = css`
  text-align: justify;
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
