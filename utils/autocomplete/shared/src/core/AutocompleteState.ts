import { type BaseItem } from './AutocompleteApi';
import { type AutocompleteCollection } from './AutocompleteCollection';
import { type AutocompleteContext } from './AutocompleteContext';

export interface AutocompleteState<TItem extends BaseItem> {
  activeItemId: number | null;
  /** the search input value */
  query: string;
  /** the completed version of the query */
  completion: string | null;
  /** the autocomplete’s collections of items */
  collections: Array<AutocompleteCollection<TItem>>;
  /** whether the autocomplete display panel is open or not */
  isOpen: boolean;
  /** the autocomplete network status. useful to display UI hints when the network is unstable */
  status: 'idle' | 'loading' | 'stalled' | 'error';
  /** the global context passed to lifecycle hooks
   * - Sometimes you need to store arbitrary data so you can access it later
   * - Autocomplete lets you store data using its Context API and access it anywhere from the state.
   * - Context can be handy when developing Autocomplete plugins.
   * - It avoids polluting the global namespace while still being able to pass data around across different lifecycle hooks.
   */
  context: AutocompleteContext;
}
