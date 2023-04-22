import { Editor, Element, Node, Transforms } from 'slate';

import type { Active, Over } from '@dnd-kit/core';

import { DraggableCollapsibleEditor } from '../collapsible-editor';
import type { NestableElement } from '../types';

export const updateElementByDnd = (
  editor: DraggableCollapsibleEditor,
  active: Active,
  over: Over,
  dragDepth: number,
) => {
  const activeIndex = active.data.current?.sortable.index;
  let overIndex = over.data.current?.sortable.index;

  const element = editor.children.find((x) => x['id'] === active.id);

  if (activeIndex < overIndex) {
    const droppableIntervals = DraggableCollapsibleEditor.getDroppableIntervals(
      editor,
      editor.semanticChildren,
      editor.children.length,
    );
    const droppableEnds = new Set(droppableIntervals.map((x) => x[1]));

    // adjust over index in case it is outside droppable elements
    for (const end of droppableEnds) {
      if (overIndex <= end) {
        overIndex = end;
        break;
      }
    }
  }

  if (active.id !== over.id) {
    moveDndElements(editor, active.id, overIndex);
  }

  if (
    DraggableCollapsibleEditor.isNestableElement(editor, element) &&
    element.depth !== dragDepth
  ) {
    updateDndDepth(editor, active.id, dragDepth);
  }
};

export const moveDndElements = (
  editor: DraggableCollapsibleEditor,
  activeId: string,
  overIndex: number,
) => {
  const element = editor.children.find((x) => x['id'] === activeId);

  if (!element) {
    return;
  }

  const collapsedCount = DraggableCollapsibleEditor.isCollapsibleElement(
    editor,
    element,
  )
    ? element.foldedCount || 0
    : 0;
  const semanticDescendants = DraggableCollapsibleEditor.isNestableElement(
    editor,
    element,
  )
    ? DraggableCollapsibleEditor.semanticDescendants(element)
    : DraggableCollapsibleEditor.semanticDescendants(element as Element)?.slice(
      0,
      collapsedCount,
    );

  const match = (node: Node) =>
    node === element ||
    (Element.isElement(node) &&
      semanticDescendants.some((x) => x.element['id'] === node['id']));

  Transforms.moveNodes(editor, {
    at: [],
    match,
    to: [overIndex],
  });
};

export const updateDndDepth = (
  editor: DraggableCollapsibleEditor,
  activeId: string,
  dragDepth: number = 0,
) => {
  Editor.withoutNormalizing(editor, () => {
    const element = editor.children.find((x) => x['id'] === activeId);

    if (DraggableCollapsibleEditor.isNestableElement(editor, element)) {
      const foldedCount = DraggableCollapsibleEditor.isCollapsibleElement(
        editor,
        element,
      )
        ? element['foldedCount'] || 0
        : 0;
      const semanticDescendants = DraggableCollapsibleEditor.isNestableElement(
        editor,
        element,
      )
        ? DraggableCollapsibleEditor.semanticDescendants(element)
        : DraggableCollapsibleEditor.semanticDescendants(element)?.slice(
          0,
          foldedCount,
        );

      const depthDiff = element.depth - dragDepth;

      const match = (node: Node) =>
        node === element ||
        (Element.isElement(node) &&
          semanticDescendants.some((x) => x.element['id'] === node['id']));

      const entries = Editor.nodes(editor, { at: [], match });

      for (const [node] of entries) {
        if (DraggableCollapsibleEditor.isNestableElement(editor, node)) {
          Transforms.setNodes<NestableElement & Node>(
            editor,
            {
              depth: node.depth - depthDiff,
            },
            {
              at: [],
              match: (_node) => _node === node,
            },
          );
        }
      }
    }
  });
};
