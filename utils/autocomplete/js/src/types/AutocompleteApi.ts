import {
  type AutocompleteScopeApi as AutocompleteCoreScopeApi,
  type BaseItem,
} from '@algolia/autocomplete-core';

import { type AutocompleteOptions } from './';

export interface AutocompleteApi<TItem extends BaseItem>
  extends AutocompleteCoreScopeApi<TItem> {
  /**
   * Updates the Autocomplete experience.
   */
  update(updatedOptions: Partial<AutocompleteOptions<TItem>>): void;
  /**
   * Cleans up the DOM mutations and event listeners.
   */
  destroy(): void;
}
