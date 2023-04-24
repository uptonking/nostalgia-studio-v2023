import React, { CSSProperties } from 'react';

import type { UniqueIdentifier } from '@dnd-kit/core';
import { AnimateLayoutChanges, useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

import { iOS } from '../utils';
import { TreeItem, TreeItemProps } from './tree-item';

type TreeItemDraggableProps = TreeItemProps;

const animateLayoutChanges: AnimateLayoutChanges = ({
  isSorting,
  wasDragging,
}) => (isSorting || wasDragging ? false : true);

export function TreeItemDraggable({
  id,
  depth,
  onlyUpdatePostionOnDrop,
  ...props
}: TreeItemDraggableProps) {
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
      id={id}
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
