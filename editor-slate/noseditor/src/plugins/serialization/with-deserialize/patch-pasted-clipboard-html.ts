import { ListTypes } from '../../list/utils';
import { crawlDOM, isDOMList, makeListItemAttributes } from '../utils';
import { isDOMElement } from '../with-serialize/utils';

const getListType = (node: Node) =>
  node.nodeName === 'OL' ? ListTypes.Numbered : ListTypes.Bulleted;

// make flatten list instead of tree
export const patchPastedClipboardHtml = (domNode: Element) => {
  crawlDOM([domNode], (node, context) => {
    if (isDOMElement(node) && isDOMList(node)) {
      const listType = getListType(node);

      context.skip();

      const items: Element[] = [];
      // get flatten list items
      crawlDOM([node], (node, context: any) => {
        if (isDOMElement(node) && node.nodeName === 'LI') {
          const attributes = makeListItemAttributes({
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
      crawlDOM(items, (node, context) => {
        if (isDOMElement(node) && isDOMList(node)) {
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
