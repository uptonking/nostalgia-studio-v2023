import { type AutocompleteNavigator } from './AutocompleteNavigator';
import { type AutocompletePropGetters } from './AutocompletePropGetters';
import { type AutocompleteSetters } from './AutocompleteSetters';

export type BaseItem = Record<string, unknown>;

export interface AutocompleteScopeApi<TItem extends BaseItem>
  extends AutocompleteSetters<TItem> {
  /**
   * Triggers a search to refresh the state.
   * - Updates the UI state with fresh sources.
   * - You must call this function whenever you mutate the state with setters and want to reflect the changes in the UI.
   */
  refresh(): Promise<void>;
  /**
   * Functions to navigate to a URL.
   */
  navigator: AutocompleteNavigator<TItem>;
}

export type AutocompleteApi<
  TItem extends BaseItem,
  TEvent = Event,
  TMouseEvent = MouseEvent,
  TKeyboardEvent = KeyboardEvent,
> = AutocompleteScopeApi<TItem> &
  AutocompletePropGetters<TItem, TEvent, TMouseEvent, TKeyboardEvent>;
