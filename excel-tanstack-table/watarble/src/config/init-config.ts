import { type WatarbleConfig, type WatarbleOptions } from '../types';
import { getHTMLElement } from '../utils/dom';
import { RegistryDefault } from '../utils/registry-default';
import { VdomRendererDefault } from '../utils/vdom';
import { defaultRender } from '../view/default-render';
import * as elements from '../view/elements';

export function initConfig(options: WatarbleOptions): WatarbleConfig {
  const { container, renderer, components, ...core } = options;

  const environment = (
    typeof window !== 'undefined' ? window : {}
  ) as typeof window;
  const containerElement = getHTMLElement(environment, container);

  const defaultElements = new RegistryDefault();
  for (const [, config] of Object.entries(elements)) {
    defaultElements.add(config.type, config.renderFn);
  }

  return {
    ...core,
    // environment,
    rendering: {
      renderer: renderer || new VdomRendererDefault(),
      defaultRender: defaultRender,
      container: containerElement,
      elements: defaultElements,
    },
  };
}
