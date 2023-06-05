import { type BaseItem } from './AutocompleteApi';
import { type InternalAutocompleteSource } from './AutocompleteSource';

export interface AutocompleteCollection<TItem extends BaseItem> {
  source: InternalAutocompleteSource<TItem>;
  items: TItem[];
}

export interface AutocompleteCollectionItemsArray<TItem extends BaseItem> {
  source: InternalAutocompleteSource<TItem>;
  items: TItem[][];
}
