import { ListVariants } from '../../list/utils';
import {
  convertHtmlToPlainText,
  getListItemPropertiesFromDom,
  isHtmlElement,
  isHtmlListItem,
  isHtmlText,
} from '../utils';

/**
 * convert dom to text
 * - list item to -/1/[]
 */
export const getClipboardPlainText = (domNode: Node) => {
  let text = '';

  if (isHtmlText(domNode) && domNode.nodeValue) {
    return domNode.nodeValue;
  }

  if (isHtmlElement(domNode) && isHtmlListItem(domNode)) {
    let listItemText = '';
    for (const childNode of Array.from(domNode.childNodes)) {
      listItemText += convertHtmlToPlainText(childNode);
    }

    const { depth, listType, index, checked } =
      getListItemPropertiesFromDom(domNode);

    const pointer =
      {
        [ListVariants.Bulleted]: '- ',
        [ListVariants.Numbered]: `${index + 1}. `,
        [ListVariants.Checkbox]: checked ? '[x] ' : '[ ] ',
      }[listType] || '';
    const indents = ' '.repeat(depth * 2);
    const result = `${indents}${pointer}${listItemText}`;

    return result;
  }

  if (isHtmlElement(domNode)) {
    for (const childNode of Array.from(domNode.childNodes)) {
      text += getClipboardPlainText(childNode);
    }

    const skipLinebreak =
      domNode.classList.contains('clipboardSkipLinebreak') ||
      (domNode.tagName === 'P' &&
        domNode.querySelector('[data-slate-zero-width]'));

    if (!skipLinebreak) {
      const display = getComputedStyle(domNode).getPropertyValue('display');

      if (
        display === 'block' ||
        display === 'list' ||
        domNode.tagName === 'BR'
      ) {
        text += '\n';
      }
    }
  }

  // 160, nbsp, Non‑breaking space
  return text.replace(new RegExp(String.fromCharCode(160), 'g'), ' ');
};
