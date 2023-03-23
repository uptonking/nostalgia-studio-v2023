import React, { useCallback } from 'react';

import cx from 'classnames';
import { RenderElementProps, useSelected, useSlateStatic } from 'slate-react';

import { listIndentWidth } from '../../config/editor';
import { useDndState } from '../../slate-extended/dnd/use-dnd-state';
import { ExtendedEditor } from '../../slate-extended/extended-editor';
import { foldElement } from '../../slate-extended/transforms/fold-element';
import { ELEMENT_TO_SEMANTIC_PATH } from '../../slate-extended/weakmaps';
import { isTodoListItemElement } from '../list/utils';
import { makeListItemAttributes } from '../serialization/utils';
import { Item, ItemProps } from './components/item';
import { Sortable } from './components/sortable';
import {
  useWrapperIntersectionObserver,
} from './use-wrapper-intersection-observer';

/**
 * may wrap item in sortable container
 */
export const Wrapper = (
  props: Omit<RenderElementProps, 'children'> & { children: React.ReactNode },
) => {
  const { attributes, children, element } = props;
  const { activeId, activeElement, dragDepth, dragOverlayHeight } =
    useDndState();

  const editor = useSlateStatic();
  const selected = useSelected();
  const id = element.id!;

  // 🚨 hack，在Editable新渲染而Slate未更新时手动跟新dargSort信息
  // todo 减少计算量
  editor.semanticChildren = ExtendedEditor.getSemanticChildren(
    editor,
    editor.children,
    {
      setPath: (element, path) => {
        ELEMENT_TO_SEMANTIC_PATH.set(element, path);
      },
    },
  );

  const semanticNode = ExtendedEditor.semanticNode(element);
  // console.log(';; getSemNode ', semanticNode.element.children[0]);
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

  const isSortableEnabled =
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

  // console.log(';; isSortableEnabled ', isSortableEnabled)
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
      // ? data-slate-node-type only used for css?
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
      {isSortableEnabled ? (
        <Sortable id={id} {...itemProps}>
          {/* <span>{realSpacing}{' - '   + ' - ' +ExtendedEditor.hasSemanticChildren(element)}</span> */}
          {children}
        </Sortable>
      ) : (
        <Item {...itemProps}>{children}</Item>
      )}
    </Tag>
  );
};
