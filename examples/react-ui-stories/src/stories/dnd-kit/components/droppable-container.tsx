import React from 'react';

import cx from 'clsx';

import { UniqueIdentifier, useDroppable } from '@dnd-kit/core';

import styles from './droppable-container.module.scss';
import { droppable } from './droppable-svg';

interface DroppableProps {
  children: React.ReactNode;
  dragging: boolean;
  id: UniqueIdentifier;
}

export function Droppable({ children, id, dragging }: DroppableProps) {
  const { isOver, setNodeRef } = useDroppable({
    id,
  });

  return (
    <div
      ref={setNodeRef}
      className={cx(
        styles.Droppable,
        isOver && styles.over,
        dragging && styles.dragging,
        children && styles.dropped,
      )}
      aria-label='Droppable region'
    >
      {children}
      {droppable}
    </div>
  );
}
