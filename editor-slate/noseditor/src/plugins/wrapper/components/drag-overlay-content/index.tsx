import React, { useEffect, useMemo } from 'react';

import cx from 'clsx';
import { clone } from 'ramda';
import { useResizeDetector } from 'react-resize-detector';
import { Editor } from 'slate';
import { useSlateStatic } from 'slate-react';

import { DragOverlayEditor } from '../../../../components/editor/drag-overlay-editor';
import { listIndentWidth } from '../../../../config/editor';
import { ExtendedEditor } from '../../../../slate-extended/extended-editor';

// import { RenderElementProps } from "slate-react/dist/components/editable";

type RenderElementProps = any;

type Props = {
  editor: Editor;
  activeId: string;
  onHeightChange: (height: number) => void;
};

export const DragOverlayContent = (props: Props) => {
  const { editor, activeId, onHeightChange } = props;
  const { ref, height = 0 } = useResizeDetector();

  useEffect(() => {
    onHeightChange(height);
  }, [height]);

  const activeIndex = editor.children.findIndex((x) => x.id === activeId);
  const element = editor.children[activeIndex];

  const initialValue = useMemo(() => {
    let content;
    if (ExtendedEditor.isNestingElement(editor, element)) {
      const semanticNode = ExtendedEditor.semanticNode(element);
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
        if (ExtendedEditor.isNestingElement(editor, element)) {
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
        dragOverlayList: ExtendedEditor.isNestingElement(editor, element),
      })}
    >
      {element && <DragOverlayEditor initialValue={initialValue} />}
    </div>
  );
};

export const DragOverlayWrapper = (props: RenderElementProps) => {
  const { element, children } = props;
  const editor = useSlateStatic();

  const realSpacing = ExtendedEditor.isNestingElement(editor, element)
    ? listIndentWidth * element.depth
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
