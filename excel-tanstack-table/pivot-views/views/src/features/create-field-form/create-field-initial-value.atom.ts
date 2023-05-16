import { atom } from 'jotai';
import type { SetRequired } from 'type-fest';

import type { ICreateFieldCommandInput } from '@datalking/pivot-cqrs';

export const createFieldInitialValueAtom = atom<
  SetRequired<Partial<ICreateFieldCommandInput['field']>, 'type' | 'name'>
>({
  type: 'string',
  name: '',
});
