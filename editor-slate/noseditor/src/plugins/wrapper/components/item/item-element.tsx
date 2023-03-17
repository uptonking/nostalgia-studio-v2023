import React, { Fragment, memo } from 'react';

import cx from 'classnames';
import { isIOS } from 'react-device-detect';
import { Element, Node } from 'slate';
import { useSlateStatic } from 'slate-react';

import { DraggableSyntheticListeners } from '@dnd-kit/core';
import { useSortable } from '@dnd-kit/sortable';
import { Transform } from '@dnd-kit/utilities';

import { ExtendedEditor } from '../../../../slate-extended/extended-editor';
import { isHeadingElement } from '../../../heading/utils';
import { isParagraphElement } from '../../../paragraph/utils';
import { DragHandle } from '../drag-handle';
import { FoldingArrow } from '../folding-arrow';
import FoldingLine from '../folding-line';
import Placeholder from '../placeholder';

type SortableAttributes = ReturnType<typeof useSortable>['attributes'];

export type ItemProps = {
  element: Element;
  elementRef?: React.RefObject<HTMLDivElement>;

  selected?: boolean;
  onFold?: React.MouseEventHandler;
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

const ItemComponent = (props: React.PropsWithChildren<ItemProps>) => {
  const {
    element,
    children,
    transition,
    transform,
    listeners,
    isDragging = false,
    isSorting = false,
    selected = false,
    onFold,
    isDragOverlay = false,
    isInViewport = false,
    hidden = false,
    dragDepth = 0,
    attributes,
  } = props;

  const editor = useSlateStatic();

  if (isHeadingElement(element)) {
    // console.log(';; h-ele ', element);
  }

  return (
    <Fragment>
      <DragHandle
        listeners={listeners}
        classes={cx({ isHeading: isHeadingElement(element) })}
      />
      {isParagraphElement(element) &&
        Node.string(element) === '' &&
        selected && <Placeholder />}
      <div
        {...attributes}
        className={cx('item', 'clipboardSkipLinebreak', {
          dragging: isDragging,
          selected: selected,
          dragOverlay: isDragOverlay,
          disableSelection: isIOS && isSorting,
          disableInteraction: isSorting,
          hidden: hidden,
          'item-list': ExtendedEditor.isNestingElement(editor, element),
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
        {ExtendedEditor.isNestingElement(editor, element) &&
          ExtendedEditor.isFoldingElement(editor, element) && (
            <FoldingLine
              element={element}
              onFold={onFold}
              transform={transform}
            />
          )}
        {ExtendedEditor.isFoldingElement(editor, element) && (
          <FoldingArrow
            element={element}
            onFold={onFold}
            classes={cx({ isHeading: isHeadingElement(element) })}
          />
        )}
        {children}
      </div>
    </Fragment>
  );
};

/** memoized ItemComponent,
 * - areEqual: returns true if props are equal and false if the props not equal
 */
export const Item = memo(ItemComponent, (prev, next) => {
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
