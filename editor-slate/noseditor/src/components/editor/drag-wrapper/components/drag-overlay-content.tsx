import React, { useEffect, useMemo } from 'react';

import cx from 'clsx';
import { clone } from 'ramda';
import { useResizeDetector } from 'react-resize-detector';
import { Editor } from 'slate';
import { type RenderElementProps, useSlateStatic } from 'slate-react';

import { DraggableCollapsibleEditor } from '../../../../plugins';
import { ListItemDefaultIndentWidth } from '../../../../utils/constants';
import { DragOverlayEditor } from '../../drag-overlay-editor';

type DragOverlayContentProps = {
  editor: DraggableCollapsibleEditor;
  activeId: string;
  onHeightChange: (height: number) => void;
};

export const DragOverlayContent = (props: DragOverlayContentProps) => {
  const { editor, activeId, onHeightChange } = props;
  const { ref, height = 0 } = useResizeDetector();

  useEffect(() => {
    onHeightChange(height);
  }, [height]);

  const activeIndex = editor.children.findIndex((x) => x.id === activeId);
  const element = editor.children[activeIndex];

  const initialValue = useMemo(() => {
    let content;
    if (DraggableCollapsibleEditor.isNestableElement(editor, element)) {
      const semanticNode = DraggableCollapsibleEditor.semanticNode(element);
      const { descendants } = semanticNode;
      const baseDepth = element.depth;

      content = clone(
        // @ts-expect-error fix-types
        element.folded
          ? [element]
          : [
              element,
              ...descendants.filter((x) => !x.hidden).map((x) => x.element),
            ],
      );

      content.forEach((element) => {
        if (DraggableCollapsibleEditor.isNestableElement(editor, element)) {
          element.depth -= baseDepth;
        }
      });
    } else {
      content = clone([element]);
    }

    return content;
  }, [editor.children, activeId]);

  return (
    <div
      ref={ref}
      contentEditable={false}
      className={cx('dragOverlay', {
        dragOverlayList: DraggableCollapsibleEditor.isNestableElement(
          editor,
          element,
        ),
      })}
    >
      {element && <DragOverlayEditor initialValue={initialValue} />}
    </div>
  );
};

export const DragOverlayWrapper = (props: RenderElementProps) => {
  const { element, children } = props;
  const editor = useSlateStatic() as DraggableCollapsibleEditor;

  const realSpacing = DraggableCollapsibleEditor.isNestableElement(
    editor,
    element,
  )
    ? ListItemDefaultIndentWidth * element.depth
    : 0;

  return (
    <div
      className='dragOverlayWrapper'
      style={
        {
          '--spacing': `${realSpacing}px`,
        } as React.CSSProperties
      }
    >
      {children}
    </div>
  );
};
