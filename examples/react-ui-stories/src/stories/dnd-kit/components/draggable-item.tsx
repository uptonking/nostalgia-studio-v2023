import React, { forwardRef } from 'react';

import cx from 'clsx';

import { type DraggableSyntheticListeners } from '@dnd-kit/core';
import { type Transform } from '@dnd-kit/utilities';

import { Handle } from './action-handle';
import styles from './draggable-item.module.scss';
import {
  draggable,
  draggableHorizontal,
  draggableVertical,
} from './draggable-svg';

export enum Axis {
  All,
  Vertical,
  Horizontal,
}

interface DraggableProps {
  axis?: Axis;
  dragOverlay?: boolean;
  dragging?: boolean;
  handle?: boolean;
  label?: string;
  listeners?: DraggableSyntheticListeners;
  style?: React.CSSProperties;
  buttonStyle?: React.CSSProperties;
  transform?: Transform | null;
}

/**
 * draggable button for use with `useDraggable` or `DragOverlay`
 */
export const Draggable = forwardRef<HTMLButtonElement, DraggableProps>(
  function Draggable(
    {
      axis,
      dragOverlay,
      dragging,
      handle,
      label,
      listeners,
      transform,
      style,
      buttonStyle,
      ...props
    },
    ref,
  ) {
    return (
      <div
        className={cx(
          styles.Draggable,
          dragOverlay && styles.dragOverlay,
          dragging && styles.dragging,
          handle && styles.handle,
        )}
        style={
          {
            ...style,
            '--translate-x': `${transform?.x ?? 0}px`,
            '--translate-y': `${transform?.y ?? 0}px`,
          } as React.CSSProperties
        }
      >
        <button
          {...props}
          aria-label='Draggable'
          data-cypress='draggable-item'
          {...(handle ? {} : listeners)}
          tabIndex={handle ? -1 : undefined}
          ref={ref}
          style={buttonStyle}
        >
          {axis === Axis.Vertical
            ? draggableVertical
            : axis === Axis.Horizontal
              ? draggableHorizontal
              : draggable}
          {handle ? <Handle {...(handle ? listeners : {})} /> : null}
        </button>
        {label ? <label>{label}</label> : null}
      </div>
    );
  },
);
