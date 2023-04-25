import type { MutableRefObject } from 'react';

import type { UniqueIdentifier } from '@dnd-kit/core';

export type TreeItem = {
  /** page id */
  id: UniqueIdentifier;
  /** sub pages */
  children: TreeItem[];
  /** page title */
  title?: string;
  collapsed?: boolean;
};

export type TreeItems = TreeItem[];

export type FlattenedItem = TreeItem & {
  index: number;
  /** parent page id */
  parentId: UniqueIdentifier | null;
  depth: number;
};

export type SensorContext = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
