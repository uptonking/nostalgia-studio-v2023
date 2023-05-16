import type { MutableRefObject } from 'react';

import type { RecordAllValues } from '@datalking/pivot-core';
import type { UniqueIdentifier } from '@dnd-kit/core';

export type SensorContext = MutableRefObject<{
  items: FlattenedSortableRecord[];
  offset: number;
}>;

export type SortableRecordItem = {
  id: UniqueIdentifier;
  children: SortableRecordItem[];
  values: RecordAllValues;
  collapsed?: boolean;
};
export type SortableRecordItems = SortableRecordItem[];

export interface FlattenedSortableRecord extends SortableRecordItem {
  parentId: UniqueIdentifier | null;
  depth: number;
  index: number;
}
