import { useCallback, useMemo, useState } from 'react';

import type {
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/core';
import { arrayMove } from '@dnd-kit/sortable';

import type { DndTreeProps } from './dnd-tree';
import type { FlattenedItem, TreeItems } from './types';
import {
  buildTree,
  flattenTree,
  getProjection,
  removeChildrenOf,
  removeItem,
  setProperty,
} from './utils';

const initialItems: TreeItems = [
  {
    id: 'Home',
    children: [],
  },
  {
    id: 'Collections',
    children: [
      { id: 'Spring', children: [] },
      { id: 'Summer', children: [] },
    ],
  },
  {
    id: 'About Us',
    children: [],
  },
];

export const useDndTree = ({
  defaultItems = initialItems,
  indentationWidth = 50,
}: DndTreeProps) => {
  const [items, setItems] = useState(() => defaultItems);
  const [activeId, setActiveId] = useState<string | undefined>(undefined);
  const [overId, setOverId] = useState<string | undefined>(undefined);
  const [offsetLeft, setOffsetLeft] = useState<number>(0);

  const flattenedItems = useMemo(() => {
    const flattenedTree = flattenTree(items);
    const collapsedItems = flattenedTree.reduce<string[]>(
      (acc, { children, collapsed, id }) =>
        collapsed && children.length ? [...acc, id] : acc,
      [],
    );

    return removeChildrenOf(
      flattenedTree,
      activeId ? [activeId, ...collapsedItems] : collapsedItems,
    );
  }, [activeId, items]);

  const projected = useMemo(
    () =>
      activeId && overId
        ? getProjection(
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
    setOverId(undefined);
    setActiveId(undefined);
    setOffsetLeft(0);

    document.body.style.setProperty('cursor', '');
  }, []);

  const handleDragStart = useCallback(
    ({ active: { id: activeId } }: DragStartEvent) => {
      setActiveId(activeId);
      setOverId(activeId);

      document.body.style.setProperty('cursor', 'grabbing');
    },
    [],
  );

  const handleDragMove = useCallback(({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  }, []);

  const handleDragOver = useCallback(({ over }: DragOverEvent) => {
    setOverId(over?.id ?? null);
  }, []);

  const handleDragEnd = useCallback(
    ({ active, over }: DragEndEvent) => {
      resetState();

      if (projected && over) {
        const { depth, parentId } = projected;
        const clonedItems: FlattenedItem[] = JSON.parse(
          JSON.stringify(flattenTree(items)),
        );
        const overIndex = clonedItems.findIndex(({ id }) => id === over.id);
        const activeIndex = clonedItems.findIndex(({ id }) => id === active.id);
        const activeTreeItem = clonedItems[activeIndex];

        clonedItems[activeIndex] = { ...activeTreeItem, depth, parentId };

        const sortedItems = arrayMove(clonedItems, activeIndex, overIndex);
        const newItems = buildTree(sortedItems);

        setItems(newItems);
      }
    },
    [items, projected, resetState],
  );

  const handleDragCancel = useCallback(() => {
    resetState();
  }, [resetState]);

  const handleRemove = useCallback((id: string) => {
    setItems((items) => removeItem(items, id));
  }, []);

  const handleAdd = useCallback((id?: string) => {
    setItems((items) => [
      { id: 'page-' + (id || Math.random()), children: [] },
      ...items,
    ]);
  }, []);

  const handleCollapse = useCallback((id: string) => {
    setItems((items) =>
      setProperty(items, id, 'collapsed', (value) => {
        return !value;
      }),
    );
  }, []);

  return {
    items,
    activeId,
    overId,
    offsetLeft,
    flattenedItems,
    projected,
    handleAdd,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleRemove,
    handleCollapse,
  };
};

export const useDndTreeAutoUpdate = () => {};
