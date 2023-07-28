import React, { useMemo, useState } from 'react';

import {
  DndContext,
  type DragEndEvent,
  type UniqueIdentifier,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type DraggableProps = {
  id?: string;
  children?: React.ReactNode;
};

/**
 * - 参数-id；
 * - 返回-setNodeRef/listeners/attributes/transform
 * - attach listeners and a ref to the DOM element that you would like to become draggable.
 * - transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
 */
function DraggableItem({
  id = 'hiDragItem',
  children = '👏🏻 Drag Me',
}: DraggableProps) {
  const { isDragging, transform, attributes, listeners, setNodeRef } =
    useDraggable({ id });

  // 👇🏻 在drag过程中会不停rerender
  console.log(';; renderDragItem ', transform);

  return (
    <button
      ref={setNodeRef}
      style={{
        transform: transform ? CSS.Translate.toString(transform) : undefined,
        boxShadow: isDragging
          ? '-1px 0 15px 0 rgba(34, 33, 81, 0.01), 0px 15px 15px 0 rgba(34, 33, 81, 0.25)'
          : undefined,
      }}
      {...attributes}
      {...listeners}
    >
      {children}
    </button>
  );
}

type DroppableProps = {
  id?: string;
  children?: React.ReactNode;
};

/**
 * - 参数-id；
 * - 返回-setNodeRef/isOver；
 * - When a draggable element is moved over your droppable element, the `isOver` property will become true.
 */
function DroppableItem({ id = 'hiDropItem', children }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({ id });

  return (
    <div
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        width: 150,
        height: 150,
        border: '1px solid',
        margin: 20,
        borderColor: isOver
          ? '#006870'
          : typeof children === 'string'
            ? '#EEE'
            : '#575a5d',
      }}
      ref={setNodeRef}
    >
      {/* <span>{typeof children}</span> */}
      {children}
    </div>
  );
}

/** 一个可拖拽元素，一个可放置容器 */
export const OneDragOneDropApp = () => {
  const DROP_ID = 'DROP_ID';
  const [isDropped, setIsDropped] = useState(false);

  const draggableElement = <DraggableItem>👏🏻 Drag Anywhere</DraggableItem>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {isDropped ? null : draggableElement}
      <DroppableItem id={DROP_ID}>
        {isDropped ? draggableElement : 'Drop Here'}
      </DroppableItem>
    </DndContext>
  );

  function handleDragEnd(event) {
    if (event.over?.id === DROP_ID) {
      setIsDropped(true);
    } else {
      setIsDropped(false);
    }
  }
};

/** 一个可拖拽元素，多个可放置容器 */
export const OneDragMultiDropApp = () => {
  // 可放置容器的id
  const containers = ['A', 'B', 'C'];
  const [parent, setParent] = useState<UniqueIdentifier | null>(null);

  const draggableMarkup = <DraggableItem />;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {parent === null ? draggableMarkup : null}

      <div style={{ display: 'flex' }}>
        {containers.map((id) => (
          <DroppableItem key={id} id={id}>
            {parent === id ? draggableMarkup : 'Drop here-' + id}
          </DroppableItem>
        ))}
      </div>
    </DndContext>
  );

  function handleDragEnd(event: DragEndEvent) {
    const { over } = event;
    setParent(over ? over.id : null);
  }
};
