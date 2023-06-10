import React, { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

import {
  closestCenter,
  defaultDropAnimation,
  DndContext,
  DragOverlay,
  type DropAnimation,
  KeyboardSensor,
  MeasuringStrategy,
  type Modifier,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { sortableTreeKeyboardCoordinates } from './keyboard-coordinates';
import { TreeItem, TreeItemDraggable } from './tree-item';
import { type SensorConfig, type TreeItems } from './types';
import { useDndTree } from './use-dnd-tree';
import { getChildCount, getFlatChildrenOf, simpleTreeData } from './utils';

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
  initialData?: TreeItems;
  isCollapsible?: boolean;
  isRemovable?: boolean;
  showDropIndicator?: boolean;
  /** original draggable item wont move position until dropped, use with indicatorLineStyle */
  retainLayoutWhenDragging?: boolean;
  indentationWidth?: number;
};

/**
 * react tree component that is draggable/collapsible/removable
 *
 * - 点击父级菜单时，会先隐藏所有子级内容，显示为指示线，符合预期
 * - 渲染时使用的是扁平化数据结构，未直接使用原树型数据
 *
 * todo
 *
 * - 优化 retainLayoutWhenDragging 模式
 * - item不支持向左水平拖动提升层级
 */
export function DndTree(props: DndTreeProps) {
  const {
    indentationWidth = 50,
    isCollapsible = false,
    isRemovable = false,
    showDropIndicator = false,
    retainLayoutWhenDragging = false,
  } = props;

  const {
    items,
    flattenedItems,
    activeId,
    candidate,
    overId,
    offsetLeft,
    handleDragStart,
    handleDragMove,
    handleDragOver,
    handleDragEnd,
    handleDragCancel,
    handleRemove,
    handleAdd,
    handleCollapse,
  } = useDndTree({ initialData: simpleTreeData, indentationWidth, ...props });
  window['tree'] = items;
  window['flat'] = flattenedItems;

  // console.log(';; candidate ', activeId, overId, candidate);

  const sensorConfig: SensorConfig = useRef({
    items: flattenedItems,
    offset: offsetLeft,
  });
  const [coordinateGetter] = useState(() =>
    sortableTreeKeyboardCoordinates(
      sensorConfig,
      showDropIndicator,
      indentationWidth,
    ),
  );
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter }),
  );

  const sortedIds = useMemo(
    () => flattenedItems.map(({ id }) => id),
    [flattenedItems],
  );
  const activeItem = useMemo(() => {
    return activeId ? flattenedItems.find(({ id }) => id === activeId) : null;
  }, [activeId, flattenedItems]);
  const activeItemChildrenFlat = useMemo(() => {
    return activeId ? getFlatChildrenOf(items, activeId).map((x) => x.id) : [];
  }, [activeId, items]);

  useEffect(() => {
    sensorConfig.current = {
      items: flattenedItems,
      offset: offsetLeft,
    };
  }, [flattenedItems, offsetLeft]);

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
          // console.log(';; item ', index, depth, JSON.stringify(item))
          // if (index === flattenedItems.length - 1) console.log(';; ==== ')
          return (
            <TreeItemDraggable
              key={id}
              id={String(id)}
              value={String(id)}
              depth={
                id === activeId && candidate && !retainLayoutWhenDragging
                  ? candidate.depth
                  : depth
              }
              indentationWidth={indentationWidth}
              indicator={showDropIndicator}
              indicatorLineStyle={
                activeId &&
                id === overId &&
                !activeItemChildrenFlat.includes(id)
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
            debug={true}
          >
            {activeId && activeItem ? (
              <TreeItem
                id={String(activeId)}
                value={String(activeId)}
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
