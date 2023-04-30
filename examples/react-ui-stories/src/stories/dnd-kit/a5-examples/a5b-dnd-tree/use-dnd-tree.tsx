import { useCallback, useMemo, useState } from 'react';

import type {
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
  UniqueIdentifier,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import type { DndTreeProps } from './dnd-tree';
import type { FlattenedItem, TreeItems } from './types';
import {
  buildTree,
  flattenTree,
  getDepthCandidate,
  removeChildrenOf,
  removeItem,
  setProperty,
} from './utils';

/**
 * use to store and update tree state
 */
export const useDndTree = ({
  initialData = [],
  indentationWidth = 50,
  retainLayoutWhenDragging = false,
}: DndTreeProps) => {
  const [items, setItems] = useState<TreeItems>(() => initialData);
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [overId, setOverId] = useState<UniqueIdentifier | null>(null);
  const [offsetLeft, setOffsetLeft] = useState<number>(0);
  const [currentPosition, setCurrentPosition] = useState<{
    parentId: UniqueIdentifier | null;
    overId: UniqueIdentifier;
  } | null>(null);

  /** if activeId exists and activeId-item has children, it will be removed.  */
  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);

    if (retainLayoutWhenDragging) return flattenedTree;

    const collapsedItems = flattenedTree.reduce<UniqueIdentifier[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      [],
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems,
    );
  }, [activeId, items, retainLayoutWhenDragging]);

  const candidate = useMemo(
    () =>
      activeId && overId
        ? getDepthCandidate(
            flattenedItems,
            activeId,
            overId,
            offsetLeft,
            indentationWidth,
          )
        : null,
    [activeId, flattenedItems, indentationWidth, offsetLeft, overId],
  );

  const resetState = useCallback(() => {
    setOverId(null);
    setActiveId(null);
    setOffsetLeft(0);
    setCurrentPosition(null);

    document.body.style.setProperty('cursor', '');
  }, []);

  const handleDragStart = useCallback(
    ({ active: { id: activeId } }: DragStartEvent) => {
      setActiveId(activeId);
      setOverId(activeId);
      const activeItem = flattenedItems.find(({ id }) => id === activeId);
      if (activeItem) {
        setCurrentPosition({
          parentId: activeItem.parentId,
          overId: activeId,
        });
      }

      // console.log(';; start ', flattenedItems);

      document.body.style.setProperty('cursor', 'grabbing');
    },
    [flattenedItems],
  );

  const handleDragMove = useCallback(({ delta }: DragMoveEvent) => {
    // console.log(';; dragMv ', delta);
    setOffsetLeft(delta.x);
  }, []);

  const handleDragOver = useCallback(({ over }: DragOverEvent) => {
    setOverId(over?.id ?? null);
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      resetState();

      if (candidate && over) {
        const { depth, parentId } = candidate;
        const itemsCopy: FlattenedItem[] = JSON.parse(
          JSON.stringify(flattenTree(items)),
        );
        const overIndex = itemsCopy.findIndex(({ id }) => id === over.id);
        const activeIndex = itemsCopy.findIndex(({ id }) => id === active.id);
        const activeTreeItem = itemsCopy[activeIndex];

        itemsCopy[activeIndex] = { ...activeTreeItem, depth, parentId };

        const sortedItems = arrayMove(itemsCopy, activeIndex, overIndex);
        const newItems = buildTree(sortedItems);

        setItems(newItems);
      }
    },
    [items, candidate, resetState],
  );

  const handleDragCancel = useCallback(() => {
    resetState();
  }, [resetState]);

  const handleRemove = useCallback((id: UniqueIdentifier) => {
    setItems((items) => removeItem(items, id));
  }, []);

  const handleAdd = useCallback((id?: UniqueIdentifier) => {
    setItems((items) => [
      { id: 'page-' + (id || Math.random()), children: [] },
      ...items,
    ]);
  }, []);

  const handleCollapse = useCallback((id: UniqueIdentifier) => {
    setItems((items) =>
      setProperty(items, id, 'collapsed', (value) => {
        return !value;
      }),
    );
  }, []);

  // console.log(';; flattenedItems-length ', flattenedItems.length)

  return {
    items,
    activeId,
    overId,
    offsetLeft,
    flattenedItems,
    candidate,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleAdd,
    handleRemove,
    handleCollapse,
  };
};

export const useDndTreeAutoUpdate = () => {};
