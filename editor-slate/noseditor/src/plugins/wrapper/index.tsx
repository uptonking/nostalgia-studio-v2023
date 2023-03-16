import React, { useCallback } from 'react';

import cx from 'classnames';
import { RenderElementProps, useSelected, useSlateStatic } from 'slate-react';

import { listIndentWidth } from '../../config/editor';
import { useDndState } from '../../slate-extended/dnd/use-dnd-state';
import { ExtendedEditor } from '../../slate-extended/extended-editor';
import { foldElement } from '../../slate-extended/transforms/fold-element';
import { isTodoListItemElement } from '../list/utils';
import { makeListItemAttributes } from '../serialization/utils';
import { Item, ItemProps } from './components/item';
import { Sortable } from './components/sortable';
import useWrapperIntersectionObserver from './use-wrapper-intersection-observer';

const Wrapper = (
  props: Omit<RenderElementProps, 'children'> & { children: React.ReactNode },
) => {
  const { attributes, children, element } = props;
  const { activeId, activeElement, dragDepth, dragOverlayHeight } =
    useDndState();

  const editor = useSlateStatic();
  const id = element.id!;
  const selected = useSelected();

  const semanticNode = ExtendedEditor.semanticNode(element);
  const { listIndex } = semanticNode;
  const isHiddenById =
    ExtendedEditor.isNestingElement(editor, activeElement) &&
    activeId !== id &&
    ExtendedEditor.isHiddenById(element, activeId);
  const hidden = semanticNode.hidden || isHiddenById;

  const isInViewport = useWrapperIntersectionObserver(
    attributes.ref,
    activeId != null,
    [hidden],
  );

  const sortableEnabled =
    !hidden && (selected || isInViewport || activeId === element.id);

  const handleFold = useCallback(() => {
    foldElement(editor, element);
  }, [editor, element]);

  const itemProps: ItemProps = {
    element: element,
    elementRef: attributes.ref,
    selected: selected,
    hidden: hidden,
    onFold: handleFold,
    isInViewport: isInViewport,
    dragDepth: dragDepth,
  };

  const isDragging = activeId === id;
  /** indent for list */
  const realSpacing = ExtendedEditor.isNestingElement(editor, element)
    ? listIndentWidth * element.depth
    : 0;

  const dragSpacing = listIndentWidth * dragDepth;

  const spellCheck = selected ? 'true' : 'false';

  const Tag = ExtendedEditor.isNestingElement(editor, element) ? 'li' : 'div';

  return (
    <Tag
      spellCheck={spellCheck}
      {...attributes}
      {...(ExtendedEditor.isNestingElement(editor, element)
        ? makeListItemAttributes({
            depth: element.depth,
            // @ts-expect-error fix-types
            listType: element.listType,
            index: listIndex,
            checked: isTodoListItemElement(element) && element.checked,
          })
        : {})}
      data-slate-node-type={element.type}
      className={cx('item-container', 'clipboardSkipLinebreak', {
        'item-container-list': ExtendedEditor.isNestingElement(editor, element),
        dragging: activeId === id,
      })}
      style={
        {
          '--spacing': `${isDragging ? dragSpacing : realSpacing}px`,
          ...(dragOverlayHeight
            ? {
                '--drag-overlay-height': `${dragOverlayHeight}px`,
              }
            : null),
        } as React.CSSProperties
      }
    >
      {sortableEnabled ? (
        <Sortable id={id} {...itemProps}>
          {children}
        </Sortable>
      ) : (
        <Item {...itemProps}>{children}</Item>
      )}
    </Tag>
  );
};

export default Wrapper;
