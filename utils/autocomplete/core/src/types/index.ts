import {
  type AlgoliaInsightsHit as _AlgoliaInsightsHit,
  type AutocompleteInsightsApi as _AutocompleteInsightsApi,
  type CreateAlgoliaInsightsPluginParams,
} from '@algolia/autocomplete-plugin-algolia-insights';
import {
  type AutocompleteOptions as _AutocompleteOptions,
  type BaseItem,
} from '@algolia/autocomplete-shared/src/core';

export * from '@algolia/autocomplete-shared/src/core';
export * from './AutocompleteStore';
export * from './AutocompleteSubscribers';

export type AutocompleteInsightsApi = _AutocompleteInsightsApi;
export type AlgoliaInsightsHit = _AlgoliaInsightsHit;
export interface AutocompleteOptions<TItem extends BaseItem>
  extends _AutocompleteOptions<TItem> {
  /**
   * Whether to enable the Insights plugin and load the Insights library if it has not been loaded yet.
   *
   * See [**autocomplete-plugin-algolia-insights**](https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-plugin-algolia-insights/) for more information.
   *
   * @default false
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-insights
   */
  insights?: CreateAlgoliaInsightsPluginParams | boolean;
}
