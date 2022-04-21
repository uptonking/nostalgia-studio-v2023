import React, { useMemo } from 'react';

import {
  DndContext,
  DragOverlay,
  DropAnimation,
  MeasuringStrategy,
  PointerSensor,
  defaultDropAnimation,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { DndTreeItem } from './tree-item';
import type { TreeItems } from './types';
import { useDndTree } from './use-dnd-tree';
import { getChildCount } from './utils';

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

const dropAnimation: DropAnimation = {
  ...defaultDropAnimation,
  dragSourceOpacity: 0.5,
};

export type DndTreeProps = {
  defaultItems?: TreeItems;
  indentationWidth?: number;
  collapsible?: boolean;
  removable?: boolean;
  showDragIndicator?: boolean;
};

/**
 * 暂不支持使用键盘方式拖拽。
 */
export function DndTree(props: DndTreeProps) {
  const {
    indentationWidth = 50,
    collapsible,
    removable,
    showDragIndicator,
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

  const activeItem = useMemo(
    () => (activeId ? flattenedItems.find(({ id }) => id === activeId) : null),
    [activeId, flattenedItems],
  );

  return (
    <DndContext
      sensors={sensors}
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
            id={id}
            value={id}
            collapsed={Boolean(collapsed && children.length)}
            depth={id === activeId && projected ? projected.depth : depth}
            indentationWidth={indentationWidth}
            indicator={showDragIndicator}
            onCollapse={
              collapsible && children.length
                ? () => handleCollapse(id)
                : undefined
            }
            onRemove={removable ? () => handleRemove(id) : undefined}
          />
        ))}
        <DragOverlay dropAnimation={dropAnimation}>
          {activeId && activeItem ? (
            <DndTreeItem
              id={activeId}
              value={activeId}
              depth={activeItem.depth}
              clone={true}
              childCount={getChildCount(items, activeId) + 1}
              indentationWidth={indentationWidth}
            />
          ) : null}
        </DragOverlay>
      </SortableContext>
    </DndContext>
  );
}
