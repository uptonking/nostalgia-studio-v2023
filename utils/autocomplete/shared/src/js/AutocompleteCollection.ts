import { type BaseItem } from '../core';

import { type InternalAutocompleteSource } from './AutocompleteSource';

export interface AutocompleteCollection<TItem extends BaseItem> {
  source: InternalAutocompleteSource<TItem>;
  items: TItem[];
}
