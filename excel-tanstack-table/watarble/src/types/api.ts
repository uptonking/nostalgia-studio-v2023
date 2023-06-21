import { type VNode } from 'snabbdom';

import { type RowData, type TableOptionsResolved } from '@tanstack/table-core';

import {
  type CorePluginConstructor,
  type UiPluginConstructor,
} from '../plugins';
import { type Watarble } from '../watarble';
import { type VdomRendererSpec } from './rendering';

export type WatarStateOptions<TData extends RowData = RowData> = {
  id?: string;
  table?: TableOptionsResolved<TData>;
  onStateChange?: (data?: TData) => void;
  corePlugins?: CorePluginConstructor[];
  uiPlugins?: UiPluginConstructor[];
  custom?: { [key: string]: any };
  external?: { [key: string]: any };
};

export type WatarViewOptions = {
  classNames?: string;
  container?: string | HTMLElement;
  renderer?: any;
  components?: any;
  // getEnvironmentProps?: any;
  // getRootProps?: any;
};

/**
 * todo migrate from tanstack-table to custom solution
 */
export type WatarbleOptions<TData extends RowData = RowData> =
  WatarViewOptions & WatarStateOptions<TData>;

export type WatarbleConfig = WatarbleOptions & {
  id: string;
  rendering: {
    renderer: VdomRendererSpec;
    defaultRender: (elemNode: VNode, watarble: Watarble) => VNode[];
    container: HTMLElement;
    elements: any;
  };
};
