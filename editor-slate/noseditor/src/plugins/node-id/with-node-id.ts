import { nanoid } from 'nanoid';
import { BaseEditor, Editor, Element, Node } from 'slate';

import { isDefined } from '../../utils';

const makeId = () => nanoid(16);

/** only add `id` to slate element, not text */
export const assignIdRecursively = (node: Node) => {
  if (Element.isElement(node)) {
    node['id'] = makeId();
    node.children.forEach(assignIdRecursively);
  }
};

export const withNodeId = <T extends Editor>(editor: T) => {
  const { apply } = editor;

  editor.apply = (operation) => {
    if (operation.type === 'insert_node') {
      // clone to be able to write (read-only)
      // const node = clone(operation.node);
      const node = JSON.parse(JSON.stringify(operation.node));
      assignIdRecursively(node);
      return apply({
        ...operation,
        node,
      });
    }

    if (operation.type === 'split_node') {
      const properties = operation.properties;

      // only for elements (node with a type)
      if ('type' in properties && isDefined(properties.type)) {
        const id = makeId();

        return apply({
          ...operation,
          properties: {
            ...operation.properties,
            id,
          } as unknown,
        });
      }
    }

    return apply(operation);
  };

  return editor;
};
