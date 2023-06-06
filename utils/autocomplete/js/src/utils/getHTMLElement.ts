import { type AutocompleteEnvironment } from '@algolia/autocomplete-core';
import { invariant } from '@algolia/autocomplete-shared';

/**
 * get dom by `document.querySelector(value)`
 */
export function getHTMLElement(
  environment: AutocompleteEnvironment,
  /** css selector or dom */
  value: string | HTMLElement,
): HTMLElement {
  if (typeof value === 'string') {
    const element = environment.document.querySelector<HTMLElement>(value);

    invariant(
      element !== null,
      `The element ${JSON.stringify(value)} is not in the document.`,
    );

    return element!;
  }

  return value;
}
