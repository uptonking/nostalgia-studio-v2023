import React, { memo, useEffect, useState } from 'react';

import { Element } from 'slate';
import { ReactEditor, useSlate } from 'slate-react';

import { getClientRect } from '@dnd-kit/core';
import { type Transform } from '@dnd-kit/utilities';

import {
  DraggableCollapsibleEditor,
  type DraggableCollapsibleElement,
  useDndContext,
} from '../../../../plugins';

type CollapsibleUnitProps = {
  onCollapse?: React.MouseEventHandler;
  transform?: Transform | null;
};

export const CollapsibleUnit = (
  props: CollapsibleUnitProps & { element: DraggableCollapsibleElement },
) => {
  const editor = useSlate() as DraggableCollapsibleEditor & ReactEditor;
  const { activeId } = useDndContext();
  const { element, onCollapse, transform } = props;
  const [height, setHeight] = useState(0);

  const hasCollapsedLine =
    DraggableCollapsibleEditor.isNestableElement(editor, element) &&
    DraggableCollapsibleEditor.isCollapsibleElement(editor, element) &&
    DraggableCollapsibleEditor.semanticNode(element).children.length > 0;

  useEffect(() => {
    if (!hasCollapsedLine) {
      if (height) setHeight(0);
      return;
    }

    try {
      const semanticDescendants =
        DraggableCollapsibleEditor.semanticDescendants(element);

      const lastDescendant = semanticDescendants[semanticDescendants.length - 1]
        ?.element as DraggableCollapsibleElement;

      if (!lastDescendant) {
        return;
      }

      const elementDom = ReactEditor.toDOMNode(editor, element);
      const lastDescendantDom = ReactEditor.toDOMNode(editor, lastDescendant);

      const byNextSibling = lastDescendant.id === activeId;

      Promise.resolve().then(() => {
        const rect1 = getClientRect(elementDom.querySelector('div')!);
        const top = rect1.top + 26;

        let bottom;
        if (byNextSibling && lastDescendantDom.nextElementSibling) {
          const rect2 = getClientRect(
            lastDescendantDom.nextElementSibling.querySelector('div')!,
          );
          bottom = rect2.top;
        } else {
          const rect2 = getClientRect(lastDescendantDom.querySelector('div')!);
          bottom = rect2.top + rect2.height;
        }

        const newHeight = Math.floor(bottom - top);
        setHeight(newHeight);
      });
    } catch (error) {
      console.error(error);
    }
  }, [
    hasCollapsedLine,
    transform,
    editor.children,
    height,
    element,
    editor,
    activeId,
  ]);

  if (hasCollapsedLine && activeId == null) {
    return (
      <CollapsibleUnitMemoized
        depth={element.depth}
        height={height}
        onCollapse={onCollapse}
      />
    );
  }

  return null;
};

const CollapsibleUnitMemoized = memo(
  ({
    depth,
    height,
    onCollapse,
  }: CollapsibleUnitProps & { depth: number; height: number }) => {
    return (
      <div
        contentEditable={false}
        className='list-line clipboardSkip'
        onClick={onCollapse}
        style={
          {
            '--height': `${height}px`,
          } as React.CSSProperties
        }
      />
    );
  },
);
