import { getCorePluginRegistry, getUiPluginRegistry } from '../plugins';
import { type WatarbleConfig, type WatarbleOptions } from '../types';
import { getHTMLElement } from '../utils/dom';
import { RegistryDefault } from '../utils/registry-default';
import { VdomRendererDefault } from '../utils/vdom';
import { defaultRender } from '../view/default-render';
import * as elements from '../view/elements';
import { defaultCorePlugins, defaultUiPlugins } from './defaults';

export function initConfig(
  options: WatarbleOptions & { id: string },
): WatarbleConfig {
  const {
    id,
    container,
    renderer,
    components,
    corePlugins,
    uiPlugins,
    ...conf
  } = options;

  const environment = (
    typeof window !== 'undefined' ? window : {}
  ) as typeof window;
  const containerElement = getHTMLElement(environment, container);

  const defaultElements = new RegistryDefault();
  for (const [, config] of Object.entries(elements)) {
    defaultElements.add(config.type, config.renderFn);
  }

  let pluginsCore = corePlugins;
  if (!pluginsCore) {
    pluginsCore = defaultCorePlugins;
  }
  for (const PlugC of pluginsCore) {
    // todo fix types for pluginKey
    getCorePluginRegistry(id).add(PlugC['pluginKey'], PlugC);
  }
  let pluginsUi = uiPlugins;
  if (!pluginsUi) {
    pluginsUi = defaultUiPlugins;
  }
  for (const PlugU of pluginsUi) {
    getUiPluginRegistry(id).add(PlugU['pluginKey'], PlugU);
  }

  return {
    id,
    ...conf,
    // environment,
    rendering: {
      renderer: renderer || new VdomRendererDefault(),
      defaultRender: defaultRender,
      container: containerElement,
      elements: defaultElements,
    },
  };
}
