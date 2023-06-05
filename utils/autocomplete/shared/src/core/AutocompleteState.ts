import { type BaseItem } from './AutocompleteApi';
import { type AutocompleteCollection } from './AutocompleteCollection';
import { type AutocompleteContext } from './AutocompleteContext';

export interface AutocompleteState<TItem extends BaseItem> {
  activeItemId: number | null;
  query: string;
  completion: string | null;
  collections: Array<AutocompleteCollection<TItem>>;
  isOpen: boolean;
  status: 'idle' | 'loading' | 'stalled' | 'error';
  context: AutocompleteContext;
}
