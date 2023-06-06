import {
  type AutocompleteScopeApi as AutocompleteCoreScopeApi,
  type BaseItem,
} from '@algolia/autocomplete-core';

import { type AutocompleteOptions } from '.';

export interface AutocompleteApi<TItem extends BaseItem>
  extends AutocompleteCoreScopeApi<TItem> {
  /**
   * Updates the Autocomplete instance with new options.
   */
  update(updatedOptions: Partial<AutocompleteOptions<TItem>>): void;
  /** Destroys the Autocomplete instance and removes it from the DOM.
   * - Cleans up the DOM mutations and event listeners.
   */
  destroy(): void;
}
