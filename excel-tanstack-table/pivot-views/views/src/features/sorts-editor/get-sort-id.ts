import { type ISortSchema } from '@datalking/pivot-core';

export const getSortId = (sort: ISortSchema | null, index: number) =>
  (sort?.fieldId ?? '') + index;
