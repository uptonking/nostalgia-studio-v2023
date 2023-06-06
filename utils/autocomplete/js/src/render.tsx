/** @jsxRuntime classic */
/** @jsx renderer.createElement */
import {
  type AutocompleteApi as AutocompleteCoreApi,
  type AutocompleteScopeApi,
  type BaseItem,
} from '@algolia/autocomplete-core';

import {
  type AutocompleteClassNames,
  type AutocompleteComponents,
  type AutocompleteDom,
  type AutocompletePropGetters,
  type AutocompleteRender,
  type AutocompleteRenderer,
  type AutocompleteState,
  type HTMLTemplate,
} from './types';
import { setProperties, setPropertiesWithoutEvents } from './utils';

type RenderProps<TItem extends BaseItem> = {
  autocomplete: AutocompleteCoreApi<TItem>;
  autocompleteScopeApi: AutocompleteScopeApi<TItem>;
  classNames: AutocompleteClassNames;
  components: AutocompleteComponents;
  html: HTMLTemplate;
  dom: AutocompleteDom;
  panelContainer: HTMLElement;
  propGetters: AutocompletePropGetters<TItem>;
  state: AutocompleteState<TItem>;
  renderer: Required<AutocompleteRenderer>;
};

/**
 * update dom.root/dom.input props
 */
export function renderSearchBox<TItem extends BaseItem>({
  autocomplete,
  autocompleteScopeApi,
  dom,
  propGetters,
  state,
}: RenderProps<TItem>): void {
  setPropertiesWithoutEvents(
    dom.root,
    propGetters.getRootProps({
      state,
      props: autocomplete.getRootProps({}),
      ...autocompleteScopeApi,
    }),
  );
  setPropertiesWithoutEvents(
    dom.input,
    propGetters.getInputProps({
      state,
      props: autocomplete.getInputProps({ inputElement: dom.input }),
      inputElement: dom.input,
      ...autocompleteScopeApi,
    }),
  );
  setProperties(dom.label, { hidden: state.status === 'stalled' });
  setProperties(dom.loadingIndicator, { hidden: state.status !== 'stalled' });
  setProperties(dom.clearButton, { hidden: !state.query });
  setProperties(dom.detachedSearchButtonQuery, {
    textContent: state.query,
  });
  setProperties(dom.detachedSearchButtonPlaceholder, {
    hidden: Boolean(state.query),
  });
}

/**
 * - append panel to dom
 * - render vdom to panel
 */
export function renderPanel<TItem extends BaseItem>(
  render: AutocompleteRender<TItem>,
  {
    autocomplete,
    autocompleteScopeApi,
    classNames,
    html,
    dom,
    panelContainer,
    propGetters,
    state,
    components,
    renderer,
  }: RenderProps<TItem>,
): void {
  if (!state.isOpen) {
    if (panelContainer.contains(dom.panel)) {
      panelContainer.removeChild(dom.panel);
    }

    return;
  }

  // We add the panel element to the DOM when it's not yet appended and that the
  // items are fetched.
  if (!panelContainer.contains(dom.panel) && state.status !== 'loading') {
    panelContainer.appendChild(dom.panel);
  }

  dom.panel.classList.toggle('aa-Panel--stalled', state.status === 'stalled');

  const sections = state.collections
    .filter(
      ({ source, items }) => source.templates.noResults || items.length > 0,
    )
    .map(({ source, items }, sourceIndex) => (
      <section
        key={sourceIndex}
        className={classNames.source}
        data-autocomplete-source-id={source.sourceId}
      >
        {source.templates.header && (
          <div className={classNames.sourceHeader}>
            {source.templates.header({
              components,
              createElement: renderer.createElement,
              Fragment: renderer.Fragment,
              items,
              source,
              state,
              html,
            })}
          </div>
        )}

        {source.templates.noResults && items.length === 0 ? (
          <div className={classNames.sourceNoResults}>
            {source.templates.noResults({
              components,
              createElement: renderer.createElement,
              Fragment: renderer.Fragment,
              source,
              state,
              html,
            })}
          </div>
        ) : (
          <ul
            className={classNames.list}
            {...propGetters.getListProps({
              state,
              props: autocomplete.getListProps({
                sourceIndex,
              }),
              ...autocompleteScopeApi,
            })}
          >
            {items.map((item) => {
              const itemProps = autocomplete.getItemProps({
                item,
                source,
                sourceIndex,
              });

              return (
                // @ts-expect-error fix-types
                <li
                  key={itemProps.id}
                  className={classNames.item}
                  {...propGetters.getItemProps({
                    state,
                    props: itemProps,
                    ...autocompleteScopeApi,
                  })}
                >
                  {
                    // 👇🏻 render list item using templates
                    source.templates.item({
                      components,
                      createElement: renderer.createElement,
                      Fragment: renderer.Fragment,
                      item,
                      state,
                      html,
                    })
                  }
                </li>
              );
            })}
          </ul>
        )}

        {source.templates.footer && (
          <div className={classNames.sourceFooter}>
            {source.templates.footer({
              components,
              createElement: renderer.createElement,
              Fragment: renderer.Fragment,
              items,
              source,
              state,
              html,
            })}
          </div>
        )}
      </section>
    ));

  const children = (
    <renderer.Fragment>
      <div className={classNames.panelLayout}>{sections}</div>
      <div className='aa-GradientBottom' />
    </renderer.Fragment>
  );
  const elements = sections.reduce((acc, current) => {
    acc[current.props['data-autocomplete-source-id']] = current;
    return acc;
  }, {});

  render(
    {
      children,
      state,
      sections,
      elements,
      ...renderer,
      components,
      html,
      ...autocompleteScopeApi,
    },
    dom.panel,
  );
}
