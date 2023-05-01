import { UniqueIdentifier } from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import type { FlattenedItem, TreeItem, TreeItems } from './types';

/**
 * id as content
 */
export const simpleTreeData: TreeItems = [
  {
    id: 'Recent',
    children: [],
  },
  {
    id: 'Favorites',
    children: [
      { id: 'Notion', children: [] },
      { id: 'FlowUs', children: [] },
    ],
  },
  {
    id: 'Personal',
    children: [
      {
        id: 'Templates',
        children: [],
      },
    ],
  },
];

export const iOS = /iPad|iPhone|iPod/.test(navigator.platform);

/** offset/indentationWidth */
function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
  return previousItem && 'depth' in previousItem ? previousItem.depth + 1 : 0;
}

function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
  return nextItem && 'depth' in nextItem && nextItem.depth > 1 ? nextItem.depth - 1 : 0;
}

export function getDepthCandidate(
  items: FlattenedItem[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number,
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems =
    activeItemIndex === overItemIndex
      ? items.slice()
      : arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const maxDepth = getMaxDepth({ previousItem });
  const minDepth = getMinDepth({ nextItem });
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  // console.log(';; can-depth ', activeItemIndex, overItemIndex, activeItem.depth, dragDepth, dragOffset);

  const projectedDepth = activeItem.depth + dragDepth;
  let depthCandidate = projectedDepth;
  if (projectedDepth >= maxDepth) {
    depthCandidate = maxDepth;
  }
  if (projectedDepth < minDepth) {
    depthCandidate = minDepth;
  }

  return {
    depth: depthCandidate,
    maxDepth,
    minDepth,
    parentId: getParentIdForCandidate(),
  };

  function getParentIdForCandidate() {
    if (depthCandidate === 0 || !previousItem) {
      return null;
    }
    if (depthCandidate === previousItem.depth) {
      return previousItem.parentId;
    }
    if (depthCandidate > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depthCandidate);

    return newParent?.parentId ?? null;
  }
}

function flatten(
  items: TreeItems,
  parentId: UniqueIdentifier | null = null,
  depth = 0,
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flatten(item.children, item.id, depth + 1),
    ];
  }, []);
}

export function flattenTree(items: TreeItems): FlattenedItem[] {
  return flatten(items);
}

export function buildTree(flattenedItems: FlattenedItem[]): TreeItems {
  const root: TreeItem = { id: 'root', children: [] };
  const nodes: Record<string, TreeItem> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, children } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id, children };
    parent.children.push(item);
  }

  return root.children;
}

export function findItem(items: TreeItem[], itemId: UniqueIdentifier) {
  return items.find(({ id }) => id === itemId);
}

export function findItemDeep(
  items: TreeItems,
  itemId: UniqueIdentifier,
): TreeItem | undefined {
  for (const item of items) {
    const { id, children } = item;

    if (id === itemId) {
      return item;
    }

    if (children.length) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
}

/** 从items中递归移除id对象 */
export function removeItem(items: TreeItems, id: UniqueIdentifier) {
  const newItems = [];

  for (const item of items) {
    if (item.id === id) {
      continue;
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
}

export function setProperty<T extends keyof TreeItem>(
  items: TreeItems,
  id: UniqueIdentifier,
  property: T,
  setter: (value: TreeItem[T]) => TreeItem[T],
) {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
}

function countChildren(items: TreeItem[], count = 0): number {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

export function getChildCount(items: TreeItems, id: UniqueIdentifier) {
  if (!id) {
    return 0;
  }

  const item = findItemDeep(items, id);
  return item ? countChildren(item.children) : 0;
}

export function getFlatChildrenOf(items: TreeItem[], id?: UniqueIdentifier) {
  if (id === undefined) flattenTree(items);

  const parent = findItemDeep(items, id);
  return parent ? flattenTree([parent]) : [];
}

export function removeChildrenOf(
  items: FlattenedItem[],
  ids: UniqueIdentifier[],
) {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
}
