import crawl from 'tree-crawl';

import { type ListVariantsType } from '../list/utils';

export const crawlDom = (
  nodes: Iterable<Node>,
  fn: (node: Node, context: crawl.Context<Node>) => void,
) => {
  return crawl({ childNodes: nodes } as Node, fn, {
    getChildren: (node) => Array.from(node.childNodes),
  });
};

export const createListItemAttributes = ({
  depth,
  listType,
  index = 0,
  checked = false,
}: {
  depth: number;
  listType: ListVariantsType;
  index?: number;
  checked?: boolean;
}) => {
  return {
    'data-slate-list-item-depth': depth,
    'data-slate-list-item-type': listType,
    'data-slate-list-item-index': index,
    'data-slate-list-item-checked': checked,
  };
};

export const getListItemPropertiesFromDom = (domNode: Element) => {
  const depth = Number(domNode.getAttribute('data-slate-list-item-depth'));
  const listType = domNode.getAttribute(
    'data-slate-list-item-type',
  ) as ListVariantsType;
  const index = Number(domNode.getAttribute('data-slate-list-item-index'));
  const checked =
    domNode.getAttribute('data-slate-list-item-checked') === 'true';

  return {
    depth,
    listType,
    index,
    checked,
  };
};

export const isHtmlListElement = (
  node: Node,
): node is HTMLOListElement | HTMLUListElement =>
  node.nodeType === Node.ELEMENT_NODE &&
  (node.nodeName === 'UL' || node.nodeName === 'OL');

export const isHtmlListItem = (node: Node): node is HTMLLIElement =>
  node.nodeType === Node.ELEMENT_NODE && node.nodeName === 'LI';

export const isHtmlText = (node: Node): node is Text => {
  return node.nodeType === Node.TEXT_NODE;
};

export const isHtmlElement = (node: Node): node is Element => {
  return node.nodeType === Node.ELEMENT_NODE;
};

export const getPlainText = (domNode: Node) => {
  let text = '';

  if (isHtmlText(domNode) && domNode.nodeValue) {
    return domNode.nodeValue;
  }

  if (isHtmlElement(domNode)) {
    if (domNode.classList.contains('clipboardSkip')) {
      return '';
    }

    for (const childNode of Array.from(domNode.childNodes)) {
      text += getPlainText(childNode);
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

  return text;
};
