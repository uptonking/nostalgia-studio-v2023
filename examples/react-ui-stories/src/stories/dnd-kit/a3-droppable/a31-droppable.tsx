import React, { useState } from 'react';

import {
  closestCenter,
  closestCorners,
  type CollisionDetection as CollisionDetectionType,
  DndContext,
  type Modifiers,
  pointerWithin,
  rectIntersection,
  type UniqueIdentifier,
  useDraggable,
} from '@dnd-kit/core';

import {
  Draggable,
  DraggableOverlay,
  Droppable,
  GridContainer,
  Wrapper,
} from '../components';

interface DroppableStoryProps {
  collisionDetection?: CollisionDetectionType;
  containers?: string[];
  modifiers?: Modifiers;
  value?: string;
}

export const BasicSetup = () => <DroppableStory />;

export const MultipleDroppable = () => (
  <DroppableStory containers={['A', 'B', 'C']} />
);

export const CollisionDetectionAlgorithms = () => {
  const [{ algorithm }, setCollisionDetectionAlgorithm] = useState({
    algorithm: rectIntersection,
  });

  return (
    <>
      <DroppableStory
        collisionDetection={algorithm}
        containers={['A', 'B', 'C']}
      />
      <div
        style={{
          position: 'absolute',
          bottom: 20,
          left: 20,
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        <h3>Collision detection algorithm</h3>
        <label>
          <input
            type='radio'
            value='rectIntersection'
            checked={algorithm === rectIntersection}
            onClick={() =>
              setCollisionDetectionAlgorithm({ algorithm: rectIntersection })
            }
          />
          Rect Intersection
        </label>
        <label>
          <input
            type='radio'
            value='closestCenter'
            checked={algorithm === closestCenter}
            onClick={() =>
              setCollisionDetectionAlgorithm({ algorithm: closestCenter })
            }
          />
          Closest Center
        </label>
        <label>
          <input
            type='radio'
            value='closestCorners'
            checked={algorithm === closestCorners}
            onClick={() =>
              setCollisionDetectionAlgorithm({ algorithm: closestCorners })
            }
          />
          Closest Corners
        </label>
        <label>
          <input
            type='radio'
            value='pointerWithin'
            checked={algorithm === pointerWithin}
            onClick={() =>
              setCollisionDetectionAlgorithm({ algorithm: pointerWithin })
            }
          />
          Pointer Within
        </label>
      </div>
    </>
  );
};

function DroppableStory({
  containers = ['A'],
  collisionDetection,
  modifiers,
}: DroppableStoryProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parent, setParent] = useState<UniqueIdentifier | null>(null);

  const draggableItem = <DraggableItem />;

  return (
    <DndContext
      collisionDetection={collisionDetection}
      modifiers={parent === null ? undefined : modifiers}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={({ over }) => {
        setParent(over ? over.id : null);
        setIsDragging(false);
      }}
      onDragCancel={() => setIsDragging(false)}
    >
      <Wrapper>
        <Wrapper style={{ width: 350, flexShrink: 0 }}>
          {parent === null ? draggableItem : null}
        </Wrapper>
        <GridContainer columns={2}>
          {containers.map((id) => (
            <Droppable key={id} id={id} dragging={isDragging}>
              {parent === id ? draggableItem : null}
            </Droppable>
          ))}
        </GridContainer>
      </Wrapper>
      <DraggableOverlay />
    </DndContext>
  );
}

function DraggableItem({ handle }: { handle?: boolean }) {
  const { isDragging, setNodeRef, listeners } = useDraggable({
    id: 'draggable-item',
  });

  return (
    <Draggable
      dragging={isDragging}
      ref={setNodeRef}
      handle={handle}
      listeners={listeners}
      style={{
        opacity: isDragging ? 0 : undefined,
      }}
    />
  );
}
