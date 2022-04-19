import cx from 'classnames';
import React, {forwardRef} from 'react';

import styles from './PlayingCard.module.css';
import {getSuitColor} from './utilities';

export interface Props {
  value: string;
  index: number;
  transform: {
    x: number;
    y: number;
  } | null;
  transition: string;
  fadeIn: boolean;
  style?: React.CSSProperties;
  isPickedUp?: boolean;
  isDragging: boolean;
  isSorting: boolean;
  mountAnimation?: boolean;
}

export const PlayingCard = forwardRef<HTMLDivElement, Props>(
  (
    {
      value,
      isDragging,
      isSorting,
      mountAnimation,
      fadeIn,
      isPickedUp,
      style,
      index,
      transform,
      transition,
      ...props
    },
    ref
  ) => {
    return (
      <div
        className={cx(styles.Wrapper, transform && styles.sorting)}
        style={
          {
            '--translate-y': transform ? `${transform.y}px` : undefined,
            '--index': index,
            '--transition': transition,
            zIndex: style?.zIndex,
          } as React.CSSProperties
        }
        ref={ref}
      >
        <div
          className={cx(
            styles.PlayingCard,
            mountAnimation && styles.mountAnimation,
            isPickedUp && styles.pickedUp,
            isDragging && styles.dragging,
            fadeIn && styles.fadeIn
          )}
          style={
            {
              ...style,
              '--scale': isPickedUp ? 1.075 : undefined,
              color: getSuitColor(value),
              zIndex: undefined,
            } as React.CSSProperties
          }
          tabIndex={0}
          {...props}
        >
          <sup>{value}</sup>
          <strong>{value[value.length - 1]}</strong>
          <sub>{value}</sub>
        </div>
      </div>
    );
  }
);
