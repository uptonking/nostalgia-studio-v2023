import {
  BorderPlugin,
  EditSessionPlugin,
  HistoryPlugin,
  SortPlugin,
  TablePlugin,
  UiOptionsPlugin,
} from '../plugins';

export const defaultCorePlugins = [EditSessionPlugin, BorderPlugin];

export const defaultUiPlugins = [
  HistoryPlugin,
  TablePlugin,
  SortPlugin,
  UiOptionsPlugin,
];
