import React, { Fragment, memo } from 'react';

import cx from 'clsx';
import { isIOS } from 'react-device-detect';
import { Element, Node } from 'slate';
import { useSlateStatic } from 'slate-react';

import type { DraggableSyntheticListeners } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { Transform } from '@dnd-kit/utilities';

import { DraggableCollapsibleEditor } from '../../../../plugins';
import { isHeadingElement } from '../../../../plugins/heading/utils';
import { isParagraphElement } from '../../../../plugins/paragraph/utils';
import { CollapsibleIcon } from './collapsible-icon';
import { CollapsibleLine } from './collapsible-unit';
import { DragHandle } from './drag-handle';
import { Placeholder } from './placeholder';

type SortableAttributes = ReturnType<typeof useSortable>['attributes'];

export type UnitItemProps = {
  element: Element;
  elementRef?: React.RefObject<HTMLDivElement>;

  selected?: boolean;
  onCollapse?: React.MouseEventHandler;
  isDragOverlay?: boolean;
  isInViewport?: boolean;
  hidden?: boolean;
  attributes?: SortableAttributes;
  dragDepth?: number;

  // sortable props
  transition?: string | null;
  transform?: Transform | null;
  listeners?: DraggableSyntheticListeners;
  isDragging?: boolean;
  isSorting?: boolean;
};

const UnitComponent = (props: React.PropsWithChildren<UnitItemProps>) => {
  const {
    element,
    children,
    transition,
    transform,
    listeners,
    isDragging = false,
    isSorting = false,
    selected = false,
    onCollapse,
    isDragOverlay = false,
    hidden = false,
    dragDepth = 0,
    attributes,
  } = props;

  const editor = useSlateStatic() as DraggableCollapsibleEditor;

  return (
    <Fragment>
      <DragHandle
        listeners={listeners}
        classes={cx({
          hidden: hidden,
          'is-heading': isHeadingElement(element),
          'is-foldable':
            DraggableCollapsibleEditor.hasSemanticChildren(element),
        })}
      />
      {
        // isParagraphElement(element) &&
        //   Node.string(element) === '' &&
        //   selected && <Placeholder />
      }
      <div
        {...attributes}
        className={cx('item', 'clipboardSkipLinebreak', {
          dragging: isDragging,
          selected: selected,
          dragOverlay: isDragOverlay,
          disableSelection: isIOS && isSorting,
          disableInteraction: isSorting,
          hidden: hidden,
          'item-list': DraggableCollapsibleEditor.isNestableElement(
            editor,
            element,
          ),
          // indicator: isDragging,
        })}
        style={
          {
            transition,
            '--translate-x': transform
              ? `${Math.round(transform.x)}px`
              : undefined,
            '--translate-y': transform
              ? `${Math.round(transform.y)}px`
              : undefined,
          } as React.CSSProperties
        }
      >
        {DraggableCollapsibleEditor.isNestableElement(editor, element) &&
          DraggableCollapsibleEditor.isCollapsibleElement(editor, element) && (
            // vertical line indicating folding
            <CollapsibleLine
              element={element}
              onCollapse={onCollapse}
              transform={transform}
            />
          )}
        {DraggableCollapsibleEditor.isCollapsibleElement(editor, element) && (
          <CollapsibleIcon
            element={element}
            onCollapse={onCollapse}
            classes={cx({ 'is-heading': isHeadingElement(element) })}
          />
        )}
        {children}
      </div>
    </Fragment>
  );
};

/** memoized UnitComponent,
 * - areEqual: returns true if props are equal and false if the props not equal
 */
export const UnitItem = memo(UnitComponent, (prev, next) => {
  for (const key of [...Object.keys(prev), ...Object.keys(next)]) {
    if (key === 'children' || key === 'listeners') {
      continue;
    }

    if (prev[key] !== next[key]) {
      return false;
    }
  }

  return true;
});
