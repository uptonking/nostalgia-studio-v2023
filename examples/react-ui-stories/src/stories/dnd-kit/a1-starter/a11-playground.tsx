import * as React from 'react';
import { useMemo, useState } from 'react';

import {
  DndContext,
  DragEndEvent,
  UniqueIdentifier,
  useDraggable,
  useDroppable,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';

type DraggableProps = {
  id?: string;
  children?: React.ReactNode;
};

/**
 * - 参数-id；返回-setNodeRef/listeners/attributes/transform
 * - attach listeners and a ref to the DOM element that you would like to become draggable.
 * - transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`
 */
function DraggableItem({
  id = 'hi-drag-item',
  children = '🤔 Drag Me',
}: DraggableProps) {
  const { attributes, isDragging, transform, setNodeRef, listeners } =
    useDraggable({
      id,
    });

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
 * - 参数-id；返回-setNodeRef/isOver；
 * - When a draggable element is moved over your droppable element, the `isOver` property will become true.
 */
function DroppableItem({ id = 'hi-drop-item', children }: DroppableProps) {
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
        borderColor: isOver ? '#4c9ffe' : '#EEE',
      }}
      ref={setNodeRef}
    >
      {children}
    </div>
  );
}

/** 一个可拖拽元素，一个可放置容器 */
export const SingleDragSingleDropApp = () => {
  const DROP_ID = 'DROP_ID';
  const [isDropped, setIsDropped] = useState(false);

  const draggableMarkup = <DraggableItem>Drag me</DraggableItem>;

  return (
    <DndContext onDragEnd={handleDragEnd}>
      {isDropped ? null : draggableMarkup}
      <DroppableItem id={DROP_ID}>
        {isDropped ? draggableMarkup : 'Drop here'}
      </DroppableItem>
    </DndContext>
  );

  function handleDragEnd(event) {
    if (event.over && event.over.id === DROP_ID) {
      setIsDropped(true);
    } else {
      setIsDropped(false);
    }
  }
};

/** 一个可拖拽元素，多个可放置容器 */
export const SingleDragMultiDropApp = () => {
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

export default SingleDragMultiDropApp;
