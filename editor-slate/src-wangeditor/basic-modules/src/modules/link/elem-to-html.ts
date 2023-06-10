/**
 * @description to html
 * @author wangfupeng
 */

import { type Element } from 'slate';
import { type LinkElement } from './custom-types';

function linkToHtml(elem: Element, childrenHtml: string): string {
  const { url, target = '_blank' } = elem as LinkElement;

  return `<a href="${url}" target="${target}">${childrenHtml}</a>`;
}

export const linkToHtmlConf = {
  type: 'link',
  elemToHtml: linkToHtml,
};
