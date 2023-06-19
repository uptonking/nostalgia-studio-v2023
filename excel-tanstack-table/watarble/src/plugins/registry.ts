import { RegistryDefault } from '../utils/registry-default';
import { type CorePluginConstructor } from './plugin-core';
import { type UIPluginConstructor } from './plugin-ui';

export const corePluginRegistry = new RegistryDefault<CorePluginConstructor>()
  .add('sheet', SheetPlugin)
  .add('cell', CellPlugin);

export const uiPluginRegistry = new RegistryDefault<UIPluginConstructor>()
  .add('ui_sheet', SheetUIPlugin)
  .add('ui_options', UIOptionsPlugin);
