import { type BaseItem } from '../core';
import { type AutocompletePlugin as AutocompleteCorePlugin } from '../core/AutocompletePlugin';

import { type AutocompleteOptions } from './AutocompleteOptions';

export type AutocompletePlugin<TItem extends BaseItem, TData> = Omit<
  AutocompleteCorePlugin<TItem, TData>,
  'getSources'
> & {
  /**
   * The [sources](https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/sources/) to get the suggestions from.
   *
   * When defined, they’re merged with the sources of your Autocomplete instance.
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/plugins/#param-getsources
   */
  getSources?: AutocompleteOptions<TItem>['getSources'];
};
