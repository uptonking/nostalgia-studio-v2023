import { ListVariants } from '../../list/utils';
import {
  crawlDom,
  createListItemAttributes,
  isHtmlElement,
  isHtmlListElement,
} from '../utils';

const getListType = (node: Node) =>
  node.nodeName === 'OL' ? ListVariants.Numbered : ListVariants.Bulleted;

/**
 * make flatten list instead of tree
 */
export const patchPastedClipboardHtml = (domNode: Element) => {
  crawlDom([domNode], (node, context) => {
    if (isHtmlElement(node) && isHtmlListElement(node)) {
      const listType = getListType(node);

      context.skip();

      const items: Element[] = [];
      // get flatten list items
      crawlDom([node], (node, context: any) => {
        if (isHtmlElement(node) && node.nodeName === 'LI') {
          const attributes = createListItemAttributes({
            depth: Math.round(context.cursor.depth / 2 - 1),
            listType,
          });
          for (const [name, value] of Object.entries(attributes)) {
            node.setAttribute(name, String(value));
          }
          items.push(node);
        }
      });

      // remove all lists as list items children, all list items is already moved out
      crawlDom(items, (node, context) => {
        if (isHtmlElement(node) && isHtmlListElement(node)) {
          node.remove();
          context.remove();
        }
      });

      node.innerHTML = '';
      for (const item of items) {
        node.appendChild(item);
      }
    }
  });
};
