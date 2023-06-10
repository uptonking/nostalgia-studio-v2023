/**
 * @description parse style html
 * @author wangfupeng
 */

import { type Descendant, Element } from 'slate';
import { type IDomEditor } from '@wangeditor/core';
import { type JustifyElement } from './custom-types';
import $, { type DOMElement, getStyleValue } from '../../utils/dom';

export function parseStyleHtml(
  elem: DOMElement,
  node: Descendant,
  editor: IDomEditor,
): Descendant {
  const $elem = $(elem);
  if (!Element.isElement(node)) return node;

  const elemNode = node as JustifyElement;

  const textAlign = getStyleValue($elem, 'text-align');
  if (textAlign) {
    elemNode.textAlign = textAlign;
  }

  return elemNode;
}
