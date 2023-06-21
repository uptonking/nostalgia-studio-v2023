import { RegistryDefault } from '../utils/registry-default';
import { type CorePluginConstructor } from './plugin-core';
import { type UiPluginConstructor } from './plugin-ui';

const pluginsRegistry: Record<string, RegistryDefault> = {};

export const getCorePluginRegistry = (id: string) => {
  id = 'CORE_' + id;
  if (pluginsRegistry[id]) {
    return pluginsRegistry[id] as RegistryDefault<CorePluginConstructor>;
  }

  const registry = new RegistryDefault<CorePluginConstructor>();
  pluginsRegistry[id] = registry;
  return registry;
};

export const getUiPluginRegistry = (id: string) => {
  id = 'UI_' + id;
  if (pluginsRegistry[id]) {
    return pluginsRegistry[id] as RegistryDefault<UiPluginConstructor>;
  }

  const registry = new RegistryDefault<UiPluginConstructor>();
  pluginsRegistry[id] = registry;
  return registry;
};
