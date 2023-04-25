import React, { useMemo } from 'react';
import { createPortal } from 'react-dom';

import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  DropAnimation,
  MeasuringStrategy,
  Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { TreeItem, TreeItemDraggable } from './tree-item';
import type { TreeItems } from './types';
import { useDndTree } from './use-dnd-tree';
import { getChildCount, getFlatChildrenOf } from './utils';

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
  /** original draggable item wont move position until dropped, use with indicatorLineStyle */
  retainLayoutWhenDragging?: boolean;
  indentationWidth?: number;
};

/**
 * - 点击父级菜单时，会先隐藏所有子级内容，显示为指示线，符合预期
 *
 * todo
 *
 * - 优化 retainLayoutWhenDragging 模式
 * - item不支持向左水平拖动提升层级
 * - onlyUpdateOnDrop模式下，首尾项的处理应该特殊处理
 * - 不支持使用键盘方式拖拽
 */
export function DndTree(props: DndTreeProps) {
  const {
    indentationWidth = 48,
    isCollapsible,
    isRemovable,
    showDropIndicator = false,
    retainLayoutWhenDragging = false,
  } = props;

  const sensors = useSensors(useSensor(PointerSensor));

  const {
    items,
    activeId,
    flattenedItems,
    projected,
    overId,
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
  const activeItem = useMemo(() => {
    return activeId ? flattenedItems.find(({ id }) => id === activeId) : null;
  }, [activeId, flattenedItems]);

  const activeItemsFlat = useMemo(() => {
    return activeId ? getFlatChildrenOf(items, activeId).map((x) => x.id) : [];
  }, [activeId, items]);

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
        {flattenedItems.map((item, index) => {
          const { id, children, collapsed, depth } = item;
          // console.log(';; item ', index, JSON.stringify(item))
          // if (index === flattenedItems.length - 1) console.log(';; ==== ')
          return (
            <TreeItemDraggable
              key={id}
              id={String(id)}
              value={String(id)}
              depth={id === activeId && projected ? projected.depth : depth}
              indentationWidth={indentationWidth}
              indicator={showDropIndicator}
              indicatorLineStyle={
                activeId && id === overId && !activeItemsFlat.includes(id)
              }
              collapsed={Boolean(collapsed && children.length)}
              onCollapse={
                isCollapsible && children.length
                  ? () => handleCollapse(id)
                  : undefined
              }
              retainLayoutWhenDragging={retainLayoutWhenDragging}
              onRemove={isRemovable ? () => handleRemove(id) : undefined}
            />
          );
        })}
        {createPortal(
          <DragOverlay
            dropAnimation={dropAnimationConfig}
            modifiers={showDropIndicator ? [adjustTranslate] : undefined}
          >
            {activeId && activeItem ? (
              <TreeItem
                id={String(activeId)}
                value={activeId.toString()}
                depth={activeItem.depth}
                clone={true}
                childCount={getChildCount(items, activeId) + 1}
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
