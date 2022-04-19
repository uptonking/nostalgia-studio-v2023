import React from 'react';
import {useDraggable} from '@dnd-kit/core';
import cx from 'classnames';

import styles from './Switch.module.css';

export function Thumb() {
  const {isDragging, listeners, transform, setNodeRef} = useDraggable({
    id: 'thumb',
  });

  return (
    <span className={styles.ThumbWrapper} {...listeners}>
      <span
        ref={setNodeRef}
        className={cx(styles.Thumb, isDragging && styles.dragging)}
        style={
          {
            '--transform': `${transform?.x ?? 0}px`,
          } as React.CSSProperties
        }
      />
    </span>
  );
}
