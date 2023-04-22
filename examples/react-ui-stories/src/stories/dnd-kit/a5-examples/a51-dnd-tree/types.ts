import type { MutableRefObject } from 'react';

import type { UniqueIdentifier } from '@dnd-kit/core';

export type TreeItem = {
  /** page id */
  id: UniqueIdentifier;
  /** page title */
  title?: string;
  /** sub pages */
  children: TreeItem[];
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
