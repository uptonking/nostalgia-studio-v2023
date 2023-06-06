import { type AutocompleteScopeApi, type BaseItem } from '../core';
import { type AutocompleteComponents } from './AutocompleteComponents';
import {
  type HTMLTemplate,
  type Pragma,
  type PragmaFrag,
  type Render,
  type VNode,
} from './AutocompleteRenderer';
import { type AutocompleteState } from './AutocompleteState';

export type AutocompleteRender<TItem extends BaseItem> = (
  params: AutocompleteScopeApi<TItem> & {
    children: VNode;
    state: AutocompleteState<TItem>;
    /** You can use `sections`, which holds the components tree of your autocomplete, to customize the wrapping layout. */
    sections: VNode[];
    /** If you need to split the content across a more complex layout, you can
     * use `elements` to pick which source to display based on its `sourceId`.
     */
    elements: Record<string, VNode>;
    components: AutocompleteComponents;
    createElement: Pragma;
    Fragment: PragmaFrag;
    html: HTMLTemplate;
    render: Render;
  },
  root: HTMLElement,
) => void;
