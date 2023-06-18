import { getHTMLElement } from '../utils/dom';
import { RegistryDefault } from '../utils/registry-default';
import { renderVdom, VdomRenderer } from '../utils/vdom';
import { defaultRender } from '../view/default-render';
import * as elements from '../view/elements';

export function getDefaultConfig(options) {
  const {
    classNames,
    container,
    getEnvironmentProps,
    getRootProps,
    render,
    renderNoResults,
    renderer,
    detachedMediaQuery,
    components,
    translations,
    ...core
  } = options;

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
    environment,
    rendering: {
      renderer: render || new VdomRenderer(),
      defaultRender: defaultRender,
      container: containerElement,
      elements: defaultElements,
    },
  };
}
