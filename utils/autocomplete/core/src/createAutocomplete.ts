import { checkOptions } from './checkOptions';
import { createStore } from './createStore';
import { getAutocompleteSetters } from './getAutocompleteSetters';
import { getDefaultProps } from './getDefaultProps';
import { getPropGetters } from './getPropGetters';
import { getMetadata, injectMetadata } from './metadata';
import { onInput } from './onInput';
import { stateReducer } from './stateReducer';
import {
  type AutocompleteApi,
  type AutocompleteOptions as AutocompleteCoreOptions,
  type AutocompleteSubscribers,
  type BaseItem,
} from './types';

// import {
//   createAlgoliaInsightsPlugin,
// } from '@algolia/autocomplete-plugin-algolia-insights';

export interface AutocompleteOptionsWithMetadata<TItem extends BaseItem>
  extends AutocompleteCoreOptions<TItem> {
  /**
   * @internal
   */
  __autocomplete_metadata?: Record<string, unknown>;
}

/**
 * this function returns methods to help you create an autocomplete experience from scratch.
 */
export function createAutocomplete<
  TItem extends BaseItem,
  TEvent = Event,
  TMouseEvent = MouseEvent,
  TKeyboardEvent = KeyboardEvent,
>(
  options: AutocompleteOptionsWithMetadata<TItem>,
): AutocompleteApi<TItem, TEvent, TMouseEvent, TKeyboardEvent> {
  checkOptions(options);

  const subscribers: AutocompleteSubscribers<TItem> = [];
  const props = getDefaultProps(options, subscribers);
  // 👇🏻 传入onStoreStateChange，每次state变化都会执行
  const store = createStore(stateReducer, props, onStoreStateChange);
  window['store'] = store;

  const setters = getAutocompleteSetters({ store });
  const propGetters = getPropGetters<
    TItem,
    TEvent,
    TMouseEvent,
    TKeyboardEvent
  >({ props, refresh, store, navigator: props.navigator, ...setters });

  function onStoreStateChange({ prevState, state }) {
    // 👇🏻 可传入视图层更新方法
    props.onStateChange({
      prevState,
      state,
      refresh,
      navigator: props.navigator,
      ...setters,
    });
  }

  /** update internal state + getSources using promise; will trigger `onStoreStateChange` */
  function refresh() {
    return onInput({
      event: new Event('input'),
      nextState: { isOpen: store.getState().isOpen },
      props,
      navigator: props.navigator,
      query: store.getState().query,
      refresh,
      store,
      ...setters,
    });
  }

  if (
    options.insights &&
    !props.plugins.some((plugin) => plugin.name === 'aa.algoliaInsightsPlugin')
  ) {
    const insightsParams =
      typeof options.insights === 'boolean' ? {} : options.insights;
    // props.plugins.push(createAlgoliaInsightsPlugin(insightsParams));
  }

  props.plugins.forEach((plugin) => {
    // subscribe to lifecycle hooks and interact with the instance’s state and context.
    plugin.subscribe?.({
      ...setters,
      navigator: props.navigator,
      refresh,
      onSelect(fn) {
        subscribers.push({ onSelect: fn });
      },
      onActive(fn) {
        subscribers.push({ onActive: fn });
      },
      // whenever a source resolves.
      onResolve(fn) {
        subscribers.push({ onResolve: fn });
      },
    });
  });

  injectMetadata({
    metadata: getMetadata({ plugins: props.plugins, options }),
    environment: props.environment,
  });

  return {
    refresh,
    navigator: props.navigator,
    ...propGetters,
    ...setters,
  };
}
