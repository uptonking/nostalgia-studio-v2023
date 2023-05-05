import React from 'react';

import { verticalListSortingStrategy } from '@dnd-kit/sortable';

import { Sortable, type SortableProps } from './sortable';

const storiesProps: Partial<SortableProps> = {
  strategy: verticalListSortingStrategy,
  itemCount: 50,
};

export const BasicSetup = () => <Sortable {...storiesProps} />;

export const WithoutDragOverlay = () => (
  <Sortable {...storiesProps} useDragOverlay={false} />
);

export const DragHandle = () => <Sortable {...storiesProps} handle />;
