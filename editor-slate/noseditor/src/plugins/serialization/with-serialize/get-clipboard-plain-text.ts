import { ListVariants } from '../../list/utils';
import { getListItemProps, isDOMListItem } from '../utils';
import { getPlainText, isDOMElement, isDOMText } from './utils';

export const getClipboardPlainText = (domNode: any) => {
  let text = '';

  if (isDOMText(domNode) && domNode.nodeValue) {
    return domNode.nodeValue;
  }

  if (isDOMElement(domNode) && isDOMListItem(domNode)) {
    let listItemText = '';
    for (const childNode of Array.from(domNode.childNodes)) {
      listItemText += getPlainText(childNode);
    }

    const { depth, listType, index, checked } = getListItemProps(domNode);

    const pointer =
      {
        [ListVariants.Bulleted]: '- ',
        [ListVariants.Numbered]: `${index + 1}. `,
        [ListVariants.TodoList]: checked ? '[x] ' : '[ ] ',
      }[listType] || '';
    const indents = ' '.repeat(depth * 2);
    const result = `${indents}${pointer}${listItemText}`;

    return result;
  }

  if (isDOMElement(domNode)) {
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

  return text.replace(new RegExp(String.fromCharCode(160), 'g'), ' ');
};
