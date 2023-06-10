import { type MutableRefObject } from 'react';

import { type UniqueIdentifier } from '@dnd-kit/core';

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
  /** top level depth is 0 */
  depth: number;
  /** parent page id */
  parentId: UniqueIdentifier | null;
};

export type SensorConfig = MutableRefObject<{
  items: FlattenedItem[];
  offset: number;
}>;
