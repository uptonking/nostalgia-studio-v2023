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
    sections: VNode[];
    elements: Record<string, VNode>;
    components: AutocompleteComponents;
    createElement: Pragma;
    Fragment: PragmaFrag;
    html: HTMLTemplate;
    render: Render;
  },
  root: HTMLElement,
) => void;
