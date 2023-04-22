import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';

import {
  Announcements,
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  DropAnimation,
  KeyboardSensor,
  MeasuringStrategy,
  Modifier,
  PointerSensor,
  UniqueIdentifier,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { DndTreeItem } from './tree-item';
import type { TreeItems } from './types';
import { useDndTree } from './use-dnd-tree';
import { getChildCount } from './utils';

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimationConfig: DropAnimation = {
  keyframes({ transform }) {
    return [
      { opacity: 1, transform: CSS.Transform.toString(transform.initial) },
      {
        opacity: 0,
        transform: CSS.Transform.toString({
          ...transform.final,
          x: transform.final.x + 5,
          y: transform.final.y + 5,
        }),
      },
    ];
  },
  easing: 'ease-out',
  sideEffects({ active }) {
    active.node.animate([{ opacity: 0 }, { opacity: 1 }], {
      duration: defaultDropAnimation.duration,
      easing: defaultDropAnimation.easing,
    });
  },
};

export type DndTreeProps = {
  defaultItems?: TreeItems;
  isCollapsible?: boolean;
  isRemovable?: boolean;
  showDropIndicator?: boolean;
  onlyUpdatePostionOnDrop?: boolean;
  indentationWidth?: number;
};

/**
 * 暂不支持使用键盘方式拖拽。
 */
export function DndTree(props: DndTreeProps) {
  const {
    indentationWidth = 48,
    isCollapsible: collapsible,
    isRemovable: removable,
    showDropIndicator = false,
    onlyUpdatePostionOnDrop = false,
  } = props;

  const sensors = useSensors(useSensor(PointerSensor));

  const {
    items,
    activeId,
    flattenedItems,
    projected,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleRemove,
    handleAdd,
    handleCollapse,
  } = useDndTree(props);

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems],
  );
  const activeItem = activeId
    ? flattenedItems.find(({ id }) => id === activeId)
    : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      measuring={measuring}
      onDragStart={handleDragStart}
      onDragMove={handleDragMove}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
      onDragCancel={handleDragCancel}
    >
      <SortableContext items={sortedIds} strategy={verticalListSortingStrategy}>
        <button onClick={() => handleAdd()}> 添加顶级节点</button>
        {flattenedItems.map(({ id, children, collapsed, depth }) => (
          <DndTreeItem
            key={id}
            id={String(id)}
            value={String(id)}
            collapsed={Boolean(collapsed && children.length)}
            depth={id === activeId && projected ? projected.depth : depth}
            indentationWidth={indentationWidth}
            indicator={showDropIndicator}
            onlyUpdatePostionOnDrop={onlyUpdatePostionOnDrop}
            onCollapse={
              collapsible && children.length
                ? () => handleCollapse(id)
                : undefined
            }
            onRemove={removable ? () => handleRemove(id) : undefined}
          />
        ))}
        {createPortal(
          <DragOverlay
            dropAnimation={dropAnimationConfig}
            modifiers={showDropIndicator ? [adjustTranslate] : undefined}
          >
            {activeId && activeItem ? (
              <DndTreeItem
                id={String(activeId)}
                depth={activeItem.depth}
                clone
                childCount={getChildCount(items, activeId) + 1}
                value={activeId.toString()}
                indentationWidth={indentationWidth}
              />
            ) : null}
          </DragOverlay>,
          document.body,
        )}
      </SortableContext>
    </DndContext>
  );
}

const adjustTranslate: Modifier = ({ transform }) => {
  return {
    ...transform,
    y: transform.y - 25,
  };
};
