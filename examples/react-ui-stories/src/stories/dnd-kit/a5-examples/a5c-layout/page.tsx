import React, { forwardRef, type HTMLAttributes } from 'react';

import cx from 'clsx';

import type { UniqueIdentifier } from '@dnd-kit/core';

import { Remove } from '../../components';
import styles from './page.module.scss';

export enum Position {
  Before = -1,
  After = 1,
}

export enum Layout {
  Horizontal = 'horizontal',
  Vertical = 'vertical',
  Grid = 'grid',
}

export interface PageProps
  extends Omit<HTMLAttributes<HTMLButtonElement>, 'id'> {
  active?: boolean;
  clone?: boolean;
  /** only for keyboard-darg */
  insertPosition?: Position;
  id: UniqueIdentifier;
  index?: number;
  layout: Layout;
  onRemove?(): void;
}

/**
 * like a card
 * - 卡片前后的指示线都通过::after伪元素实现
 */
export const Page = forwardRef<HTMLLIElement, PageProps>(function PageRef(
  {
    id,
    index,
    active,
    clone,
    insertPosition,
    layout,
    onRemove,
    style,
    ...props
  },
  ref,
) {
  return (
    <li
      ref={ref}
      className={cx(
        styles.Wrapper,
        // is dragging
        active && styles.active,
        // is in overlay
        clone && styles.clone,
        insertPosition === Position.Before && styles.insertBefore,
        insertPosition === Position.After && styles.insertAfter,
        layout === Layout.Vertical && styles.vertical,
      )}
      style={style}
    >
      <button className={styles.Page} data-id={id.toString()} {...props}>
        {
          index != null ? (
            <span className={styles.PageNumber}>{index}</span>
          ) : (
            ''
          ) // '' or null
        }
      </button>
      {!active && onRemove ? (
        <Remove className={styles.Remove} onClick={onRemove} />
      ) : null}
    </li>
  );
});
