import { getHTMLElement } from '../utils/dom';

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

  const defaultComponents = {};

  return {
    ...core,
    environment,
    renderer: {
      container: containerElement,
      components: defaultComponents,
    },
  };
}
