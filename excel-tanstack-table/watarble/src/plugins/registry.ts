import { RegistryDefault } from '../utils/registry-default';
import { CellPlugin } from './core/cell';
import { SheetPlugin } from './core/sheet';
import { type CorePluginConstructor } from './plugin-core';
import { type UIPluginConstructor } from './plugin-ui';
import { UIOptionsPlugin } from './ui-config/ui-options';
import { SortPlugin } from './ui-table/sort';
import { TablePlugin } from './ui-table/table';

export const corePluginRegistry = new RegistryDefault<CorePluginConstructor>();
// .add('sheet', SheetPlugin)
// .add('cell', CellPlugin);

export const uiPluginRegistry = new RegistryDefault<UIPluginConstructor>()
  .add('uiOptions', UIOptionsPlugin)
  .add('table', TablePlugin)
  .add('tableSort', SortPlugin);
