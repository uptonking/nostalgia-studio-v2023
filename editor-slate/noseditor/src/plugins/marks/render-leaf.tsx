import './styles.scss';

import * as React from 'react';

import type { RenderLeafProps } from 'slate-react';

export const renderLeaf = ({ attributes, children, leaf }: RenderLeafProps) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>;
  }

  if (leaf.code) {
    children = <code>{children}</code>;
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
    children = <sup>{children}</sup>
  }
  if (leaf.subscript) {
    children = <sub>{children}</sub>
  }

  let styles = {} as React.CSSProperties;
  if (leaf.fontSize) {
    styles = { ...styles, fontSize: leaf.fontSize }
  }
  if (leaf.color) {
    styles = { ...styles, color: leaf.color }
  }
  if (leaf.bgColor) {
    styles = { ...styles, backgroundColor: leaf.color }
  }

  // console.log(';; leaf.fontSize ', leaf.fontSize, styles)

  return <span style={styles} {...attributes}>{children}</span>;
};
