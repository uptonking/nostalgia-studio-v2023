import { type FacetHit, type Hit } from '@algolia/client-search';

import { type MaybePromise } from '../MaybePromise';
import {
  type SearchForFacetValuesResponse,
  type SearchResponse,
} from '../preset-algolia/algoliasearch';
import { type RequesterDescription } from '../preset-algolia/createRequester';
import { type AutocompleteScopeApi, type BaseItem } from './AutocompleteApi';
import { type GetSourcesParams } from './AutocompleteOptions';
import { type AutocompleteState } from './AutocompleteState';

export interface OnSelectParams<TItem extends BaseItem>
  extends AutocompleteScopeApi<TItem> {
  state: AutocompleteState<TItem>;
  event: any;
  item: TItem;
  itemInputValue: ReturnType<
    InternalAutocompleteSource<TItem>['getItemInputValue']
  >;
  itemUrl: ReturnType<InternalAutocompleteSource<TItem>['getItemUrl']>;
  source: InternalAutocompleteSource<TItem>;
}

export type OnActiveParams<TItem extends BaseItem> = OnSelectParams<TItem>;

export type OnResolveParams<TItem extends BaseItem> = {
  source: AutocompleteSource<TItem>;
  results:
    | SearchForFacetValuesResponse
    | SearchResponse<TItem>
    | TItem[]
    | TItem[][];
  items:
    | FacetHit[][]
    | FacetHit[]
    | Array<Hit<TItem>>
    | Array<
        | SearchForFacetValuesResponse
        | SearchResponse<TItem>
        | TItem[]
        | TItem[][]
      >;
  state: AutocompleteState<TItem>;
};

type DefaultIndicator = {
  /**
   * Optional key on a function to indicate it's the default value of this function.
   */
  __default?: boolean;
};

export interface AutocompleteSource<TItem extends BaseItem> {
  /**
   * Unique identifier for the source.
   */
  sourceId: string;
  /**
   * The function called to get the value of an item.
   * - The value is used to fill the search box.
   * - It lets you fill the search box with a new value whenever the user selects an item, allowing them to refine their query and retrieve more relevant results.
   */
  getItemInputValue?: DefaultIndicator &
    (({
      item,
      state,
    }: {
      item: TItem;
      state: AutocompleteState<TItem>;
    }) => string);
  /**
   * The function called to get the URL of the item.
   * - The value is used to add [keyboard accessibility](https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/keyboard-navigation/) features to let users open items in the current tab, a new tab, or a new window.
   * - It lets users open items in a new tab directly from the dropdown menu by using `Enter` key(not by mouse click) .
   */
  getItemUrl?: DefaultIndicator &
    (({
      item,
      state,
    }: {
      item: TItem;
      state: AutocompleteState<TItem>;
    }) => string | undefined);
  /**
   * The function is called when the input changes, and returns the items to display.
   * - You can use this function to filter the items based on the query.
   * - supports promises so that you can fetch sources from any asynchronous API. It can be any third-party API you can query with an HTTP request.
   */
  getItems(
    params: GetSourcesParams<TItem>,
  ): MaybePromise<TItem[] | TItem[][] | RequesterDescription<TItem>>;
  /**
   * The function called whenever an item is selected(clicked).
   */
  onSelect?: DefaultIndicator & ((params: OnSelectParams<TItem>) => void);
  /**
   * The function called whenever an item is active.
   *
   * You can trigger different behaviors if the item is active depending on the triggering event using the `event` parameter.
   */
  onActive?: DefaultIndicator & ((params: OnActiveParams<TItem>) => void);
  /**
   * The function called whenever a source resolves.
   */
  onResolve?: DefaultIndicator & ((params: OnResolveParams<TItem>) => void);
}

export type InternalAutocompleteSource<TItem extends BaseItem> = {
  [KParam in keyof AutocompleteSource<TItem>]-?: AutocompleteSource<TItem>[KParam];
};
