import {
  type AutocompleteOptions as AutocompleteCoreOptions,
  type BaseItem,
} from '@algolia/autocomplete-core';
import { type AutocompleteOptions as AutocompleteJsOptions } from '@algolia/autocomplete-shared/src/js';

export * from '@algolia/autocomplete-shared/src/js';
export * from './AutocompleteApi';
export * from './AutocompleteDom';

export type {
  AutocompleteInsightsApi,
  AlgoliaInsightsHit,
} from '@algolia/autocomplete-core';

export interface AutocompleteOptions<TItem extends BaseItem>
  extends AutocompleteJsOptions<TItem> {
  insights?: AutocompleteCoreOptions<TItem>['insights'];
}
