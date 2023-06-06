import {
  type AutocompleteOptions as AutocompleteCoreOptions,
  type AutocompleteScopeApi,
  type BaseItem,
  type GetSourcesParams,
} from '../core';
import { type MaybePromise } from '../MaybePromise';
import { type AutocompleteClassNames } from './AutocompleteClassNames';
import { type PublicAutocompleteComponents } from './AutocompleteComponents';
import { type AutocompletePlugin } from './AutocompletePlugin';
import { type AutocompletePropGetters } from './AutocompletePropGetters';
import { type AutocompleteRender } from './AutocompleteRender';
import { type AutocompleteRenderer } from './AutocompleteRenderer';
import { type AutocompleteSource } from './AutocompleteSource';
import { type AutocompleteState } from './AutocompleteState';
import { type AutocompleteTranslations } from './AutocompleteTranslations';

export interface OnStateChangeProps<TItem extends BaseItem>
  extends AutocompleteScopeApi<TItem> {
  /**
   * The current Autocomplete state.
   */
  state: AutocompleteState<TItem>;
  /**
   * The previous Autocomplete state.
   */
  prevState: AutocompleteState<TItem>;
}

export type GetSources<TItem extends BaseItem> = (
  params: GetSourcesParams<TItem>,
) => MaybePromise<Array<AutocompleteSource<TItem> | boolean | undefined>>;

export interface AutocompleteOptions<TItem extends BaseItem>
  extends AutocompleteCoreOptions<TItem>,
    Partial<AutocompletePropGetters<TItem>> {
  /**
   * The container for the Autocomplete search box.
   * - You can either pass a CSS selector or an [Element](https://developer.mozilla.org/docs/Web/API/HTMLElement).
   * - If there are several containers matching the selector, Autocomplete picks up the first one.
   * - Make sure to provide a container (like a `div`), not an `input`.
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-container
   */
  container: string | HTMLElement;
  /**
   * The container for the Autocomplete panel.
   *
   * You can either pass a [CSS selector](https://developer.mozilla.org/docs/Web/CSS/CSS_Selectors) or an [Element](https://developer.mozilla.org/docs/Web/API/HTMLElement). If there are several containers matching the selector, Autocomplete picks up the first one.
   *
   * @default document.body
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-panelcontainer
   */
  panelContainer?: string | HTMLElement;
  /**
   * The Media Query to turn Autocomplete into a detached experience.
   * - The detached mode turns the dropdown display into a full screen, modal experience.
   *
   * @default "(max-width: 680px)"
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-detachedmediaquery
   * @link https://developer.mozilla.org/en-US/docs/Web/CSS/Media_Queries/Using_media_queries
   */
  detachedMediaQuery?: string;
  /**
   * Sources define where to retrieve the items to display in your autocomplete dropdown.
   * - You define your sources in the `getSources` function by returning an array of source objects.
   * - Each source object needs to include a `sourceId` and a `getItems` function that returns the items to display.
   * - Sources can be static or dynamic(remove promise).
   */
  getSources?: GetSources<TItem>;
  /**
   * The panel's horizontal position.
   *
   * @default "input-wrapper-width"
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-panelplacement
   */
  panelPlacement?: 'start' | 'end' | 'full-width' | 'input-wrapper-width';
  /**
   * Class names to inject for each created DOM element.
   *
   * This is useful to style your autocomplete with external CSS frameworks.
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-classnames
   */
  classNames?: Partial<AutocompleteClassNames>;
  /**
   * The function that renders the autocomplete panel, i.e dropdown contents.
   * - This is useful to customize the rendering, for example, using multi-row or multi-column layouts.
   * - default implementation: render(children, root);
   * - You can use `sections`, which holds the components tree of your autocomplete, to customize the wrapping layout.
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-render
   */
  render?: AutocompleteRender<TItem>;
  /**
   * The function that renders a no results section when there are no hits.
   *
   * This is useful to let the user know that the query returned no results.
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-rendernoresults
   */
  renderNoResults?: AutocompleteRender<TItem>;
  initialState?: Partial<AutocompleteState<TItem>>;
  onStateChange?(props: OnStateChangeProps<TItem>): void;
  /**
   * The virtual DOM implementation to plug to Autocomplete. It defaults to `Preact`.
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-renderer
   */
  renderer?: AutocompleteRenderer;
  plugins?: Array<AutocompletePlugin<any, any>>;
  /**
   * Components to register in the Autocomplete rendering lifecycles.
   *
   * Registered components become available in [`templates`](https://www.algolia.com/doc/ui-libraries/autocomplete/core-concepts/templates/), [`render`](https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-render), and in [`renderNoResults`](https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-rendernoresults).
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-components
   */
  components?: PublicAutocompleteComponents;
  /**
   * A mapping of translation strings.
   * - A dictionary of translations to support internationalization.
   *
   * Defaults to English values.
   *
   * @link https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-translations
   */
  translations?: Partial<AutocompleteTranslations>;
}
