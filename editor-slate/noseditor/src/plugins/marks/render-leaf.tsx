/* eslint-disable no-param-reassign */
import * as React from 'react';

import { type RenderLeafProps } from 'slate-react';

import { css } from '@linaria/core';

import { type FormattedText } from './types';

export const renderLeaf = ({
  attributes,
  children,
  leaf,
}: RenderLeafProps & { leaf: FormattedText }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code className={codeCss}>{children}</code>;
  }

  if (leaf.italic) {
    children = <em>{children}</em>;
  }

  if (leaf.underline) {
    children = <u>{children}</u>;
  }

  if (leaf.strikethrough) {
    children = <s>{children}</s>;
  }

  if (leaf.superscript) {
    children = <sup>{children}</sup>;
  }
  if (leaf.subscript) {
    children = <sub>{children}</sub>;
  }

  let styles = {} as React.CSSProperties;
  if (leaf.fontSize) {
    styles = { ...styles, fontSize: leaf.fontSize };
  }
  if (leaf.color) {
    styles = { ...styles, color: leaf.color };
  }
  if (leaf.bgColor) {
    styles = { ...styles, backgroundColor: leaf.bgColor };
  }

  return (
    <span style={styles} {...attributes}>
      {children}
    </span>
  );
};

const codeCss = css`
  margin-left: 2px;
  margin-right: 2px;
  padding: 2px 3px;
  border-radius: 3px;
  font-size: 85%;
  white-space: break-spaces;
  background-color: #eceff4;
`;
