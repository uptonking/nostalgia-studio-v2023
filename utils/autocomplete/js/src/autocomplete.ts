import htm from 'htm';

import {
  type AutocompleteScopeApi,
  type BaseItem,
  createAutocomplete,
} from '@algolia/autocomplete-core';
import {
  createRef,
  debounce,
  getItemsCount,
  warn,
} from '@algolia/autocomplete-shared';

import { createAutocompleteDom } from './createAutocompleteDom';
import { createEffectWrapper } from './createEffectWrapper';
import { createReactiveWrapper } from './createReactiveWrapper';
import { getDefaultOptions } from './getDefaultOptions';
import { getPanelPlacementStyle } from './getPanelPlacementStyle';
import { renderPanel, renderSearchBox } from './render';
import {
  type AutocompleteApi,
  type AutocompleteOptions,
  type AutocompletePropGetters,
  type AutocompleteSource,
  type AutocompleteState,
  type VNode,
} from './types';
import { userAgents } from './userAgents';
import { mergeDeep, pickBy, setProperties } from './utils';

let instancesCount = 0;

/**
 * This function creates an autocomplete experience and attaches it to an element of the DOM.
 * - By default, it uses Preact to render.
 *
 * @returns state setters and a `refresh` method that updates the UI state with fresh sources.
 */
export function autocomplete<TItem extends BaseItem>(
  options: AutocompleteOptions<TItem>,
): AutocompleteApi<TItem> {
  const { runEffect, cleanupEffects, runEffects } = createEffectWrapper();
  const { reactive, runReactives } = createReactiveWrapper();

  const hasNoResultsSourceTemplateRef = createRef(false);
  const optionsRef = createRef(options);

  const props = reactive(() => getDefaultOptions(optionsRef.current));
  const isDetached = reactive(
    () =>
      props.value.core.environment.matchMedia(
        props.value.renderer.detachedMediaQuery,
      ).matches,
  );

  const onStateChangeRef =
    createRef<AutocompleteOptions<TItem>['onStateChange']>(undefined);

  /** 👇🏻 core instance */
  const autocomplete = reactive(() =>
    createAutocomplete<TItem>({
      ...props.value.core,
      onStateChange(params) {
        hasNoResultsSourceTemplateRef.current = params.state.collections.some(
          (collection) =>
            (collection.source as AutocompleteSource<TItem>).templates
              .noResults,
        );
        // trigger view update
        onStateChangeRef.current?.(params as any);
        props.value.core.onStateChange?.(params as any);
      },
      shouldPanelOpen:
        optionsRef.current.shouldPanelOpen ||
        (({ state }) => {
          if (isDetached.value) {
            return true;
          }

          const hasItems = getItemsCount(state) > 0;

          if (!props.value.core.openOnFocus && !state.query) {
            return hasItems;
          }

          const hasNoResultsTemplate = Boolean(
            hasNoResultsSourceTemplateRef.current ||
              props.value.renderer.renderNoResults,
          );

          return (!hasItems && hasNoResultsTemplate) || hasItems;
        }),
      __autocomplete_metadata: {
        userAgents,
        options,
      },
    }),
  );

  /** internal state */
  const lastStateRef = createRef<AutocompleteState<TItem>>({
    collections: [],
    completion: null,
    context: {},
    isOpen: false,
    query: '',
    activeItemId: null,
    status: 'idle',
    ...props.value.core.initialState,
  });

  const propGetters: AutocompletePropGetters<TItem> = {
    getEnvironmentProps: props.value.renderer.getEnvironmentProps,
    getFormProps: props.value.renderer.getFormProps,
    getInputProps: props.value.renderer.getInputProps,
    getItemProps: props.value.renderer.getItemProps,
    getLabelProps: props.value.renderer.getLabelProps,
    getListProps: props.value.renderer.getListProps,
    getPanelProps: props.value.renderer.getPanelProps,
    getRootProps: props.value.renderer.getRootProps,
  };

  const autocompleteScopeApi: AutocompleteScopeApi<TItem> = {
    setActiveItemId: autocomplete.value.setActiveItemId,
    setQuery: autocomplete.value.setQuery,
    setCollections: autocomplete.value.setCollections,
    setIsOpen: autocomplete.value.setIsOpen,
    setStatus: autocomplete.value.setStatus,
    setContext: autocomplete.value.setContext,
    refresh: autocomplete.value.refresh,
    navigator: autocomplete.value.navigator,
  };

  const html = reactive(() =>
    htm.bind<VNode>(props.value.renderer.renderer.createElement),
  );

  /** 👇🏻 create dom containers, no content for dropdown */
  const doms = reactive(() =>
    createAutocompleteDom({
      autocomplete: autocomplete.value,
      autocompleteScopeApi,
      classNames: props.value.renderer.classNames,
      environment: props.value.core.environment,
      isDetached: isDetached.value,
      placeholder: props.value.core.placeholder,
      propGetters,
      setIsModalOpen,
      state: lastStateRef.current,
      translations: props.value.renderer.translations,
    }),
  );

  function setPanelPosition() {
    setProperties(doms.value.panel, {
      style: isDetached.value
        ? {}
        : getPanelPlacementStyle({
            panelPlacement: props.value.renderer.panelPlacement,
            container: doms.value.root,
            form: doms.value.form,
            environment: props.value.core.environment,
          }),
    });
  }

  /** 👇🏻 renderSearchBox + renderPanel/dropdown */
  function scheduleRender(state: AutocompleteState<TItem>) {
    lastStateRef.current = state;

    const renderProps = {
      autocomplete: autocomplete.value,
      autocompleteScopeApi,
      classNames: props.value.renderer.classNames,
      components: props.value.renderer.components,
      container: props.value.renderer.container,
      html: html.value,
      dom: doms.value,
      panelContainer: isDetached.value
        ? doms.value.detachedContainer
        : props.value.renderer.panelContainer,
      propGetters,
      state: lastStateRef.current,
      renderer: props.value.renderer.renderer,
    };

    const render =
      (!getItemsCount(state) &&
        !hasNoResultsSourceTemplateRef.current &&
        props.value.renderer.renderNoResults) ||
      props.value.renderer.render;

    // search input dom already created, only update props here
    renderSearchBox(renderProps);
    // append panel to dom, render vdom to panel
    renderPanel(render, renderProps);
  }

  runEffect(() => {
    const environmentProps = autocomplete.value.getEnvironmentProps({
      formElement: doms.value.form,
      panelElement: doms.value.panel,
      inputElement: doms.value.input,
    });

    setProperties(props.value.core.environment as any, environmentProps);

    return () => {
      setProperties(
        props.value.core.environment as any,
        Object.keys(environmentProps).reduce((acc, key) => {
          return {
            ...acc,
            [key]: undefined,
          };
        }, {}),
      );
    };
  });

  console.log(';; init-render before ');

  runEffect(() => {
    const panelContainerElement = isDetached.value
      ? props.value.core.environment.document.body
      : props.value.renderer.panelContainer;
    const panelElement = isDetached.value
      ? doms.value.detachedOverlay
      : doms.value.panel;

    if (isDetached.value && lastStateRef.current.isOpen) {
      setIsModalOpen(true);
    }

    // 👇🏻 initial render
    scheduleRender(lastStateRef.current);
    console.log(';; init-render ing ');

    return () => {
      if (panelContainerElement.contains(panelElement)) {
        panelContainerElement.removeChild(panelElement);
      }
    };
  });

  console.log(';; init-render after ');

  runEffect(() => {
    const containerElement = props.value.renderer.container;
    containerElement.appendChild(doms.value.root);
    console.log(';; append-root ');

    return () => {
      containerElement.removeChild(doms.value.root);
    };
  });

  runEffect(() => {
    const debouncedRender = debounce<{
      state: AutocompleteState<TItem>;
    }>(({ state }) => {
      console.log(';; stateChg-to-rerender ');
      scheduleRender(state);
    }, 0);

    // 👇🏻 register rerender if state changes
    onStateChangeRef.current = ({ state, prevState }) => {
      if (isDetached.value && prevState.isOpen !== state.isOpen) {
        setIsModalOpen(state.isOpen);
      }

      // The outer DOM might have changed since the last time the panel was
      // positioned. The layout might have shifted vertically for instance.
      // It's therefore safer to re-calculate the panel position before opening
      // it again.
      if (!isDetached.value && state.isOpen && !prevState.isOpen) {
        setPanelPosition();
      }

      // We scroll to the top of the panel whenever the query changes (i.e. new
      // results come in) so that users don't have to.
      if (state.query !== prevState.query) {
        const scrollablePanels =
          props.value.core.environment.document.querySelectorAll(
            '.aa-Panel--scrollable',
          );
        scrollablePanels.forEach((scrollablePanel) => {
          if (scrollablePanel.scrollTop !== 0) {
            scrollablePanel.scrollTop = 0;
          }
        });
      }

      debouncedRender({ state });
    };

    return () => {
      onStateChangeRef.current = undefined;
    };
  });

  runEffect(() => {
    const onResize = debounce<Event>(() => {
      const previousIsDetached = isDetached.value;
      isDetached.value = props.value.core.environment.matchMedia(
        props.value.renderer.detachedMediaQuery,
      ).matches;

      if (previousIsDetached !== isDetached.value) {
        update({});
      } else {
        requestAnimationFrame(setPanelPosition);
      }
    }, 20);
    props.value.core.environment.addEventListener('resize', onResize);

    return () => {
      props.value.core.environment.removeEventListener('resize', onResize);
    };
  });

  runEffect(() => {
    if (!isDetached.value) {
      return () => {};
    }

    function toggleModalClassname(isActive: boolean) {
      doms.value.detachedContainer.classList.toggle(
        'aa-DetachedContainer--modal',
        isActive,
      );
    }

    function onChange(event: MediaQueryListEvent) {
      toggleModalClassname(event.matches);
    }

    const isModalDetachedMql = props.value.core.environment.matchMedia(
      getComputedStyle(
        props.value.core.environment.document.documentElement,
      ).getPropertyValue('--aa-detached-modal-media-query'),
    );

    toggleModalClassname(isModalDetachedMql.matches);

    // Prior to Safari 14, `MediaQueryList` isn't based on `EventTarget`,
    // so we must use `addListener` and `removeListener` to observe media query lists.
    // See https://developer.mozilla.org/en-US/docs/Web/API/MediaQueryList/addListener
    const hasModernEventListener = Boolean(isModalDetachedMql.addEventListener);

    hasModernEventListener
      ? isModalDetachedMql.addEventListener('change', onChange)
      : isModalDetachedMql.addListener(onChange);

    return () => {
      hasModernEventListener
        ? isModalDetachedMql.removeEventListener('change', onChange)
        : isModalDetachedMql.removeListener(onChange);
    };
  });

  runEffect(() => {
    requestAnimationFrame(setPanelPosition);

    return () => {};
  });

  function destroy() {
    instancesCount--;
    cleanupEffects();
  }

  /**
   * Updates the Autocomplete instance with new options.
   * - runReactives + runEffects + scheduleRender
   * - wraps refresh
   */
  function update(updatedOptions: Partial<AutocompleteOptions<TItem>> = {}) {
    cleanupEffects();

    const { components, ...rendererProps } = props.value.renderer;

    optionsRef.current = mergeDeep(
      rendererProps,
      props.value.core,
      {
        // We need to filter out default components so they can be replaced with
        // a new `renderer`, without getting rid of user components.
        // @MAJOR Deal with registering components with the same name as the
        // default ones. If we disallow overriding default components, we'd just
        // need to pass all `components` here.
        components: pickBy(
          components,
          ({ value }) => !value.hasOwnProperty('__autocomplete_componentName'),
        ),
        initialState: lastStateRef.current,
      },
      updatedOptions,
    );

    runReactives();
    runEffects();

    autocomplete.value.refresh().then(() => {
      scheduleRender(lastStateRef.current);
    });
  }

  function setIsModalOpen(value: boolean) {
    requestAnimationFrame(() => {
      const prevValue = props.value.core.environment.document.body.contains(
        doms.value.detachedOverlay,
      );

      if (value === prevValue) {
        return;
      }

      if (value) {
        props.value.core.environment.document.body.appendChild(
          doms.value.detachedOverlay,
        );
        props.value.core.environment.document.body.classList.add('aa-Detached');
        doms.value.input.focus();
      } else {
        props.value.core.environment.document.body.removeChild(
          doms.value.detachedOverlay,
        );
        props.value.core.environment.document.body.classList.remove(
          'aa-Detached',
        );
      }
    });
  }

  warn(
    instancesCount === 0,
    `Autocomplete doesn't support multiple instances running at the same time. Make sure to destroy the previous instance before creating a new one.

See: https://www.algolia.com/doc/ui-libraries/autocomplete/api-reference/autocomplete-js/autocomplete/#param-destroy`,
  );

  instancesCount++;

  // returns state setters and a `refresh` method that updates the UI state with fresh sources.
  // These setters are useful to control the autocomplete experience from external events.
  return {
    ...autocompleteScopeApi,
    update,
    destroy,
  };
}
