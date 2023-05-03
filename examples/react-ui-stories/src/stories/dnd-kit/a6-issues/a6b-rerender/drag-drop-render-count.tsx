import React, { useEffect, useRef } from 'react';

import { DndContext, useDraggable, useDroppable } from '@dnd-kit/core';
import { css } from '@linaria/core';

interface DraggableProps {
  id: string;
}

const Draggable = React.memo(function DraggableInner({ id }: DraggableProps) {
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current++;
  });

  const { setNodeRef, listeners, attributes, transform } = useDraggable({ id });

  const style = transform
    ? {
      transform: `translate(${transform.x}px, ${transform.y}px)`,
    }
    : undefined;

  return (
    <div
      className={draggableCss}
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
    >
      Draggable {id} {renderCountRef.current}
    </div>
  );
});

interface DroppableProps {
  id: string;
}

const Droppable = React.memo(function DroppableInner({ id }: DroppableProps) {
  const renderCountRef = useRef(0);
  useEffect(() => {
    renderCountRef.current++;
  });

  const { setNodeRef } = useDroppable({ id: 'droppable-' + id });

  return (
    <div className={droppableCss} ref={setNodeRef}>
      Droppable {id} {renderCountRef.current}
    </div>
  );
});

export function DragDropRenderCountApp(): React.ReactElement {
  return (
    <DndContext>
      {range(10).map((r) => (
        <div key={r} className={rowCss}>
          {range(10).map((c) => {
            const id = `${r + 1}-${c + 1}`;

            return (
              <div key={id}>
                <Draggable id={id} />
                <Droppable id={id} key={id} />
              </div>
            );
          })}
        </div>
      ))}
    </DndContext>
  );
}

function range(num: number) {
  if (!num) return [];
  return [...Array(num)].map((_, idx) => idx);
}

const rowCss = css`
  display: flex;
  background-color: #fafafa;
`;

const draggableCss = css`
  width: 100px;
  height: 100px;
  margin: 0.5rem;
  background-color: linen;
`;

const droppableCss = css`
  width: 100px;
  height: 100px;
  margin: 0.5rem;
  background-color: aliceblue;
`;
