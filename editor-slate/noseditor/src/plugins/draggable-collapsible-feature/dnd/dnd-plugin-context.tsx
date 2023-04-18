import React, { useCallback, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';

import { Editor, Element, Transforms } from 'slate';
import { ReactEditor } from 'slate-react';

import {
  AutoScrollActivator,
  DndContext,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  MeasuringStrategy,
  MouseSensor,
  TouchSensor,
  TraversalOrder,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import {
  SortableContext,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { ListItemDefaultIndentWidth } from '../../../utils/constants';
import { DraggableCollapsibleEditor } from '../collapsible-editor';
import { updateElementByDnd } from '../commands/update-element-by-dnd';
import { sortableCollisionDetection } from './sortable-collision-detection';
import { DndStateProvider } from './use-dnd-state';
import { getDepth } from './utils';

const measuring = {
  droppable: {
    strategy: MeasuringStrategy.Always,
  },
};

type DndPluginContextProps = {
  editor: DraggableCollapsibleEditor & ReactEditor;
  onDragStart?(event: DragStartEvent): void;
  onDragEnd?(event: DragEndEvent): void;
  renderDragOverlay: (props: {
    editor: DraggableCollapsibleEditor & ReactEditor;
    activeId: string;
    onHeightChange: (height: number) => void;
  }) => React.ReactElement;
};

export const DndPluginContext = ({
  editor,
  onDragStart,
  onDragEnd,
  renderDragOverlay,
  children,
}: React.PropsWithChildren<DndPluginContextProps>) => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const activeElement = editor.children.find((x) => x.id === activeId) || null;
  const semanticNode = activeElement
    ? DraggableCollapsibleEditor.semanticNode(activeElement)
    : null;

  const [overId, setOverId] = useState<string | null>(null);
  const [offsetLeft, setOffsetLeft] = useState<number>(0);
  const [_dragOverlayHeight, setDragOverlayHeight] = useState<number | null>(
    null,
  );
  const minOverlayHeight = semanticNode
    ? (semanticNode.descendants.filter((x) => !x.hidden).length + 1) * 26
    : 0;
  const dragOverlayHeight =
    _dragOverlayHeight &&
    DraggableCollapsibleEditor.isCollapsibleElement(editor, activeElement) &&
    DraggableCollapsibleEditor.isNestableElement(editor, activeElement) &&
    !activeElement.folded
      ? Math.max(minOverlayHeight, _dragOverlayHeight)
      : null;

  const offsetDepth = Math.round(offsetLeft / ListItemDefaultIndentWidth);
  const dragDepth = useMemo(
    () =>
      overId && Element.isElement(activeElement)
        ? getDepth(editor, editor.children, activeElement, overId, offsetDepth)
        : 0,
    [editor.children, overId, activeElement, offsetDepth],
  );

  const items = useMemo(
    () => editor.children.map((item) => item.id!).filter(Boolean),
    [editor.children],
  );

  const clearSelection = () => {
    ReactEditor.blur(editor);
    Transforms.deselect(editor);
    window.getSelection()?.empty();
  };

  const sensors = useSensors(
    useSensor(MouseSensor, {
      activationConstraint: {
        distance: 0.5,
      },
    }),
    useSensor(TouchSensor, {
      activationConstraint: {
        delay: 200,
        tolerance: 5,
      },
    }),
  );

  const handleDragStart = useCallback((event: DragStartEvent) => {
    clearSelection();
    onDragStart && onDragStart(event);

    const { active } = event;

    if (!active) {
      return;
    }

    document.body.classList.add('dragging');

    setActiveId(active.id);
    setOverId(active.id);
  }, []);

  const handleDragMove = ({ delta }: DragMoveEvent) => {
    setOffsetLeft(delta.x);
  };

  const handleDragOver = ({ over }: DragOverEvent) => {
    setOverId(over?.id ?? null);
  };

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      onDragEnd && onDragEnd(event);
      const { active, over } = event;

      if (over) {
        updateElementByDnd(editor, active, over, dragDepth);
      }

      const selectIndex = editor.children.findIndex((x) => x.id === active.id);
      ReactEditor.focus(editor);
      Transforms.select(editor, Editor.end(editor, [selectIndex]));

      resetState();
    },
    [editor, dragDepth],
  );

  const handleDragCancel = () => {
    resetState();
  };

  const resetState = () => {
    setActiveId(null);
    setOffsetLeft(0);

    document.body.classList.remove('dragging');
  };

  return (
    <DndStateProvider
      value={useMemo(
        () => ({
          activeId,
          activeElement,
          dragDepth,
          dragOverlayHeight,
        }),
        [activeId, activeElement, dragDepth, dragOverlayHeight],
      )}
    >
      <DndContext
        collisionDetection={sortableCollisionDetection}
        onDragStart={handleDragStart}
        onDragMove={handleDragMove}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
        onDragCancel={handleDragCancel}
        sensors={sensors}
        measuring={measuring}
        autoScroll={
          false && {
            threshold: {
              x: 0.18,
              y: 0.18,
            },
            interval: 5,
            acceleration: 20,
            activator: AutoScrollActivator.Pointer,
            order: TraversalOrder.TreeOrder,
          }
        }
      >
        <SortableContext strategy={verticalListSortingStrategy} items={items}>
          {children}
        </SortableContext>
        {createPortal(
          <DragOverlay
            adjustScale={false}
            dropAnimation={{
              duration: 220,
              easing: 'cubic-bezier(.43,.96,.36,1.13)',
              dragSourceOpacity: 0,
            }}
          >
            {activeId &&
              renderDragOverlay({
                editor,
                activeId,
                onHeightChange: (height) => setDragOverlayHeight(height),
              })}
          </DragOverlay>,
          document.body,
        )}
      </DndContext>
    </DndStateProvider>
  );
};
