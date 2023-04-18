import React, { useCallback } from 'react';

import cx from 'clsx';
import {
  type ReactEditor,
  RenderElementProps,
  useSelected,
  useSlateStatic,
} from 'slate-react';

import { DraggableCollapsibleEditor, useDndState } from '../../../plugins';
import {
  collapseElement,
} from '../../../plugins/draggable-collapsible-feature/commands/collapse-element';
import {
  ELEMENT_TO_SEMANTIC_PATH,
} from '../../../plugins/draggable-collapsible-feature/weakmaps';
import { isCheckboxListItemElement } from '../../../plugins/list/utils';
import { makeListItemAttributes } from '../../../plugins/serialization/utils';
import { ListItemDefaultIndentWidth } from '../../../utils/constants';
import { SortableUnit } from './components/sortable-unit';
import { UnitItem, type UnitItemProps } from './components/unit-element';
import { useDragObserver } from './use-drag-observer';

/**
 * may wrap item in sortable container
 */
export const DragWrapper = (
  props: Omit<RenderElementProps, 'children'> & { children: React.ReactNode },
) => {
  const { attributes, children, element } = props;
  const { activeId, activeElement, dragDepth, dragOverlayHeight } =
    useDndState();

  const editor = useSlateStatic() as DraggableCollapsibleEditor & ReactEditor;
  const selected = useSelected();
  const id = element.id!;

  // 🚨 hack，在Editable rerender而SlateProvider未更新时手动跟新dargSort信息
  // todo 减少计算量
  editor.semanticChildren = DraggableCollapsibleEditor.getSemanticChildren(
    editor,
    editor.children,
    {
      setPath: (element, path) => {
        ELEMENT_TO_SEMANTIC_PATH.set(element, path);
      },
    },
  );

  const semanticNode = DraggableCollapsibleEditor.semanticNode(element);
  // console.log(';; getSemNode ', semanticNode.element.children[0]);
  const { listIndex } = semanticNode;
  const isHiddenById =
    DraggableCollapsibleEditor.isNestableElement(editor, activeElement) &&
    activeId !== id &&
    DraggableCollapsibleEditor.isHiddenById(element, activeId);
  const hidden = semanticNode.hidden || isHiddenById;

  const isInViewport = useDragObserver(attributes.ref, activeId != null, [
    hidden,
  ]);

  const isSortableEnabled =
    !hidden && (selected || isInViewport || activeId === element.id);

  const handleCollapse = useCallback(() => {
    collapseElement(editor, element);
  }, [editor, element]);

  const itemProps: UnitItemProps = {
    element: element,
    elementRef: attributes.ref,
    selected: selected,
    hidden: hidden,
    onCollapse: handleCollapse,
    isInViewport: isInViewport,
    dragDepth: dragDepth,
  };

  const isDragging = activeId === id;

  /** indent for list */
  const realSpacing = DraggableCollapsibleEditor.isNestableElement(
    editor,
    element,
  )
    ? ListItemDefaultIndentWidth * element.depth
    : 0;

  const dragSpacing = ListItemDefaultIndentWidth * dragDepth;

  const spellCheck = selected ? 'true' : 'false';

  const Tag = DraggableCollapsibleEditor.isNestableElement(editor, element)
    ? 'li'
    : 'div';

  // console.log(';; isSortableEnabled ', isSortableEnabled)
  return (
    <Tag
      spellCheck={spellCheck}
      {...attributes}
      {...(DraggableCollapsibleEditor.isNestableElement(editor, element)
        ? makeListItemAttributes({
            depth: element.depth,
            // @ts-expect-error fix-types
            listType: element.listType,
            index: listIndex,
            checked: isCheckboxListItemElement(element) && element.checked,
          })
        : {})}
      // ? data-slate-node-type only used for css?
      data-slate-node-type={element.type}
      className={cx('item-container', 'clipboardSkipLinebreak', {
        'item-container-list': DraggableCollapsibleEditor.isNestableElement(
          editor,
          element,
        ),
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
        <SortableUnit id={id} {...itemProps}>
          {/* <span>{realSpacing}{' - '   + ' - ' +ExtendedEditor.hasSemanticChildren(element)}</span> */}
          {children}
        </SortableUnit>
      ) : (
        <UnitItem {...itemProps}>{children}</UnitItem>
      )}
    </Tag>
  );
};
