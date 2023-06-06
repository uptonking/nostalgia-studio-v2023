import { type AutocompleteScopeApi, type BaseItem } from './AutocompleteApi';
import { type AutocompleteOptions } from './AutocompleteOptions';
import { type PluginReshape } from './AutocompleteReshape';
import {
  type OnActiveParams,
  type OnResolveParams,
  type OnSelectParams,
} from './AutocompleteSource';

type PluginSubscriber<TParams> = (params: TParams) => void;

export interface PluginSubscribeParams<TItem extends BaseItem>
  extends AutocompleteScopeApi<TItem> {
  onSelect(fn: PluginSubscriber<OnSelectParams<TItem>>): void;
  onActive(fn: PluginSubscriber<OnActiveParams<TItem>>): void;
  onResolve(fn: PluginSubscriber<OnResolveParams<TItem>>): void;
}

/**
 * The plugins that encapsulate and distribute custom Autocomplete behaviors.
 * - a plugin is an object that implements the AutocompletePlugin interface.
 * - It can provide sources, react to state changes, and hook into various autocomplete lifecycle steps. It has access to setters, including the Context API, allowing it to store and retrieve arbitrary data at any time.
 * - Plugins execute sequentially, in the order you define them.
 *
 */
export type AutocompletePlugin<
  TItem extends BaseItem,
  TData = unknown,
> = Partial<
  Pick<AutocompleteOptions<any>, 'onStateChange' | 'onSubmit' | 'onReset'> &
    Pick<AutocompleteOptions<TItem>, 'getSources'>
> & {
  /**
   * The function called when Autocomplete starts.
   * - It runs once when the autocomplete instance starts and lets you subscribe to lifecycle hooks and interact with the instance’s state and context.
   * - It lets you subscribe to lifecycle hooks and interact with the instance's state and context.
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/plugins/#param-subscribe
   */
  subscribe?(params: PluginSubscribeParams<any>): void;
  /**
   * An extra plugin object to expose properties and functions as APIs.
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/plugins/#param-data
   */
  data?: TData;
  /**
   * A name to identify the plugin.
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/plugins/#param-name
   */
  name?: string;
  /**
   * A function to reshape the sources.
   *
   * It gets called before the user's reshape function.
   */
  reshape?: PluginReshape<TItem>;
  /**
   * @internal
   */
  __autocomplete_pluginOptions?: Record<string, any>;
};
