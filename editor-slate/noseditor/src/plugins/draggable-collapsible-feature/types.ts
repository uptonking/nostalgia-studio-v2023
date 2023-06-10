import { type Element } from 'slate';

export interface IdentityElement {
  id?: string;
}

export type CollapsibleElement = {
  folded?: boolean;
  foldedCount?: number;
};

/**
 * todo remove hash
 */
export interface HashedElement {
  hash?: string;
}

export type NestableElement = {
  depth: number;
};

export type DraggableCollapsibleElement = NestableElement &
  CollapsibleElement &
  IdentityElement &
  Element;

/**
 * slateElement with dragSortInfo
 */
export type SemanticNode<T extends Element = Element> = {
  element: T;
  children: SemanticNode[];
  index: number;
  listIndex: number;
  hidden: boolean;
  folded: SemanticNode | undefined;
  descendants: SemanticNode[];
};
