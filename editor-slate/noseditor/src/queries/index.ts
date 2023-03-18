import { Node } from 'slate';

export const isEmptyNode = (node: Node) => {
  const result = node && Node.string(node) === '';
  return result;
};
