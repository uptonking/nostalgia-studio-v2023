import cx from 'classnames';
import React, { CSSProperties, HTMLAttributes, forwardRef } from 'react';

import styles from './tree-item.module.scss';

export type TreeItemProps = {
  /** 该行要显示的主要文字 */
  value: string;
  /** node所在层数，0、1、2 */
  depth: number;
  /** DragOverlay中的item为clone，普通列表中的不为clone，通过clone控制显示删除图标 */
  clone?: boolean;
  childCount?: number;
  collapsed?: boolean;
  disableInteraction?: boolean;
  disableSelection?: boolean;
  /** isDragging */
  ghost?: boolean;
  handleProps?: any;
  indicator?: boolean;
  indentationWidth: number;
  onCollapse?(): void;
  onRemove?(): void;
  /** 最外层容器的ref，常作为droppable-node；内层dom的ref常作为draggable-node */
  wrapperRef?(node: HTMLLIElement): void;
} & HTMLAttributes<HTMLLIElement>;

export const TreeItem = forwardRef<HTMLDivElement, TreeItemProps>(
  (
    {
      childCount,
      clone,
      depth,
      disableSelection,
      disableInteraction,
      ghost,
      handleProps,
      indentationWidth,
      indicator,
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
            '--spacing': `${indentationWidth * depth}px`,
          } as CSSProperties
        }
        {...props}
      >
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

export interface ActionProps extends React.HTMLAttributes<HTMLButtonElement> {
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties['cursor'];
}

/** 可定制样式的button */
export function Action({
  active,
  className,
  cursor,
  style,
  ...props
}: ActionProps) {
  return (
    <button
      {...props}
      className={cx(styles.Action, className)}
      tabIndex={0}
      style={
        {
          ...style,
          cursor,
          '--fill': active?.fill,
          '--background': active?.background,
        } as CSSProperties
      }
    />
  );
}

export function Handle(props: ActionProps) {
  return (
    <Action cursor='grab' data-cypress='draggable-handle' {...props}>
      <svg viewBox='0 0 20 20' width='12'>
        <path d='M7 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 2zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 7 14zm6-8a2 2 0 1 0-.001-4.001A2 2 0 0 0 13 6zm0 2a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 8zm0 6a2 2 0 1 0 .001 4.001A2 2 0 0 0 13 14z'></path>
      </svg>
    </Action>
  );
}

export function Remove(props: ActionProps) {
  return (
    <Action
      {...props}
      active={{
        fill: 'rgba(255, 70, 70, 0.95)',
        background: 'rgba(255, 70, 70, 0.1)',
      }}
    >
      <svg width='8' viewBox='0 0 22 22' xmlns='http://www.w3.org/2000/svg'>
        <path d='M2.99998 -0.000206962C2.7441 -0.000206962 2.48794 0.0972617 2.29294 0.292762L0.292945 2.29276C-0.0980552 2.68376 -0.0980552 3.31682 0.292945 3.70682L7.58591 10.9998L0.292945 18.2928C-0.0980552 18.6838 -0.0980552 19.3168 0.292945 19.7068L2.29294 21.7068C2.68394 22.0978 3.31701 22.0978 3.70701 21.7068L11 14.4139L18.2929 21.7068C18.6829 22.0978 19.317 22.0978 19.707 21.7068L21.707 19.7068C22.098 19.3158 22.098 18.6828 21.707 18.2928L14.414 10.9998L21.707 3.70682C22.098 3.31682 22.098 2.68276 21.707 2.29276L19.707 0.292762C19.316 -0.0982383 18.6829 -0.0982383 18.2929 0.292762L11 7.58573L3.70701 0.292762C3.51151 0.0972617 3.25585 -0.000206962 2.99998 -0.000206962Z' />
      </svg>
    </Action>
  );
}
