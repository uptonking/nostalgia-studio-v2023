import { parseAlgoliaHitReverseHighlight } from '@algolia/autocomplete-preset-algolia';

import { type AutocompleteRenderer, type HighlightHitParams } from '../types';

export function createReverseHighlightComponent({
  createElement,
  Fragment,
}: AutocompleteRenderer) {
  function ReverseHighlight<THit>({
    hit,
    attribute,
    tagName = 'mark',
  }: HighlightHitParams<THit>): JSX.Element {
    return createElement(
      Fragment,
      {},
      parseAlgoliaHitReverseHighlight<THit>({
        hit,
        attribute,
      }).map((x, index) =>
        x.isHighlighted
          ? createElement(tagName, { key: index }, x.value)
          : x.value,
      ),
    );
  }

  ReverseHighlight.__autocomplete_componentName = 'ReverseHighlight';

  return ReverseHighlight;
}
