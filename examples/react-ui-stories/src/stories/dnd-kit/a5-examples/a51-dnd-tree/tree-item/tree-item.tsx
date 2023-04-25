import React, { CSSProperties, forwardRef, HTMLAttributes } from 'react';

import cx from 'clsx';

import type { UniqueIdentifier } from '@dnd-kit/core';

import { Action, Handle, Remove } from '../../../components';
import styles from './tree-item.module.scss';

export type TreeItemProps = {
  id: UniqueIdentifier;
  /** 该行显示的文字内容 */
  value: string;
  /** node所在层数，0、1、2 */
  depth: number;
  /** DragOverlay中的item为clone，普通列表中的不为clone，通过clone控制显示删除图标 */
  clone?: boolean;
  childCount?: number;
  collapsed?: boolean;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  /** whether isDragging */
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indicatorLineStyle?: boolean;
  /** original draggable item wont move position until dropped, use with indicatorLineStyle */
  retainLayoutWhenDragging?: boolean;
  indentationWidth: number;
  onCollapse?(): void;
  onRemove?(): void;
  /** 最外层容器的ref，常作为droppable-node；内层dom的ref常作为draggable-node */
  wrapperRef?(node: HTMLLIElement): void;
} & HTMLAttributes<HTMLLIElement>;

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      id,
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
      indicatorLineStyle,
      collapsed,
      onCollapse,
      onRemove,
      style,
      value,
      wrapperRef,
      ...props
    },
    ref,
  ) => {
    if (value === 'Notion') {
      // console.log(';; Notion ', clone, ghost, indicator);
    }

    return (
      <li
        ref={wrapperRef}
        className={cx(
          styles.Wrapper,
          clone && styles.clone,
          ghost && styles.ghost,
          indicator && styles.indicator,
          disableSelection && styles.disableSelection,
          disableInteraction && styles.disableInteraction,
        )}
        style={
          {
            // todo migrate to translate
            paddingLeft: `${indentationWidth * depth}px`,
            // '--spacing': `${indentationWidth * depth}px`,
          } as CSSProperties
        }
        {...props}
      >
        <div
          className={cx(styles.dropIndicator, {
            [styles.showDropIndicator]: indicatorLineStyle,
          })}
        />
        <div ref={ref} className={styles.TreeItem} style={style}>
          <Handle {...handleProps} />
          {onCollapse && (
            <Action
              onClick={onCollapse}
              className={cx(styles.Collapse, collapsed && styles.collapsed)}
            >
              <svg
                width='10'
                xmlns='http://www.w3.org/2000/svg'
                viewBox='0 0 70 41'
              >
                <path d='M30.76 39.2402C31.885 40.3638 33.41 40.995 35 40.995C36.59 40.995 38.115 40.3638 39.24 39.2402L68.24 10.2402C69.2998 9.10284 69.8768 7.59846 69.8494 6.04406C69.822 4.48965 69.1923 3.00657 68.093 1.90726C66.9937 0.807959 65.5106 0.178263 63.9562 0.150837C62.4018 0.123411 60.8974 0.700397 59.76 1.76024L35 26.5102L10.24 1.76024C9.10259 0.700397 7.59822 0.123411 6.04381 0.150837C4.4894 0.178263 3.00632 0.807959 1.90702 1.90726C0.807714 3.00657 0.178019 4.48965 0.150593 6.04406C0.123167 7.59846 0.700153 9.10284 1.75999 10.2402L30.76 39.2402Z' />
              </svg>
            </Action>
          )}
          <span className={styles.Text}>{value}</span>
          {!clone && onRemove && <Remove onClick={onRemove} />}
          {clone && childCount && childCount > 1 ? (
            <span className={styles.Count}>{childCount}</span>
          ) : null}
        </div>
      </li>
    );
  },
);
