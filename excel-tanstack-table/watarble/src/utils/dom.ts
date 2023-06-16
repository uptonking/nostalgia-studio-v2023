import { type RuntimeEnvironment } from '../types';

export function getHTMLElement(
  environment: RuntimeEnvironment,
  value: string | HTMLElement,
): HTMLElement {
  if (typeof value === 'string') {
    const element = environment.document.querySelector<HTMLElement>(value);

    if (!element) {
      throw new Error(
        `The element ${JSON.stringify(value)} is not in the document.`,
      );
    }

    return element!;
  }

  return value;
}
