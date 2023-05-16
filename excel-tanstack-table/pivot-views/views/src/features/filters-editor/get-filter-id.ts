import type { IFilter } from '@datalking/pivot-core';

export const getFilterId = (f: IFilter | null, index: number) =>
  (f?.path.toString() ?? '') + index;
