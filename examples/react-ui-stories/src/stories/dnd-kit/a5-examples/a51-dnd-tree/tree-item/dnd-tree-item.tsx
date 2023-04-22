import React, { CSSProperties } from 'react';

import type { UniqueIdentifier } from '@dnd-kit/core';
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { iOS } from '../utils';
import { TreeItem, TreeItemProps } from './tree-item';

type DndTreeItemProps = TreeItemProps & {
  id: UniqueIdentifier;
  onlyUpdatePostionOnDrop?: boolean;
};

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

export function DndTreeItem({
  id,
  depth,
  onlyUpdatePostionOnDrop,
  ...props
}: DndTreeItemProps) {
  const {
    attributes,
    isDragging,
    isSorting,
    listeners,
    setDraggableNodeRef,
    setDroppableNodeRef,
    transform,
    transition,
  } = useSortable({ id, animateLayoutChanges });

  const style: CSSProperties = {
    transition,
  };

  if (!onlyUpdatePostionOnDrop) {
    style.transform = CSS.Translate.toString(transform);
  }

  return (
    <TreeItem
      ref={setDraggableNodeRef}
      wrapperRef={setDroppableNodeRef}
      style={style}
      depth={depth}
      ghost={isDragging}
      disableSelection={iOS}
      disableInteraction={isSorting}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      {...props}
    />
  );
}
