import React, { forwardRef, useState } from 'react';

import { DndContext, DragOverlay, useDraggable } from '@dnd-kit/core';

/**
 * render our presentational components within `<Draggable>` and within `<DragOverlay>`
 * - 官方提供了 wrapper 和 forwardRef 2种思路
 */
function DragOverlayApp() {
  const [isDragging, setIsDragging] = useState(false);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <DraggableItem id='my-draggable-element' />
      {/* <Draggable id="my-draggable-element">
        <Item />
      </Draggable> */}

      <DragOverlay>{isDragging ? <Item /> : null}</DragOverlay>
    </DndContext>
  );

  function handleDragStart() {
    setIsDragging(true);
  }

  function handleDragEnd() {
    setIsDragging(false);
  }
}

const Item = forwardRef(({ children, ...props }: any, ref) => {
  return (
    <li {...props} ref={ref}>
      {children}
    </li>
  );
});

function DraggableItem(props) {
  const { attributes, listeners, setNodeRef } = useDraggable({
    id: props.id,
  });

  return (
    <Item ref={setNodeRef} {...attributes} {...listeners}>
      {props.value}
    </Item>
  );
}
